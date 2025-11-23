import TelegramBot from 'node-telegram-bot-api';
import { env } from '../config/env';
import { UserService } from './UserService';
import { WorkoutPlanService } from './WorkoutPlanService';
import { FitnessLevel, FitnessGoal } from '../entities/User';

// User state for multi-step profile setup
interface UserSetupState {
  step: 'fitness_level' | 'goal' | 'days' | 'duration' | 'equipment' | 'injuries' | 'complete';
  data: {
    fitnessLevel?: FitnessLevel;
    primaryGoal?: FitnessGoal;
    preferredWorkoutDays?: string[];
    preferredDuration?: number;
    availableEquipment?: string[];
    injuries?: string;
  };
}

export class TelegramBotService {
  private bot: TelegramBot;
  private userService: UserService;
  private workoutPlanService: WorkoutPlanService;
  private userStates: Map<number, UserSetupState>; // Store user setup states

  constructor() {
    // Use polling options to prevent conflicts
    this.bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { 
      polling: {
        interval: 1000,
        autoStart: true,
        params: { timeout: 10 }
      }
    });
    this.userService = new UserService();
    this.workoutPlanService = new WorkoutPlanService();
    this.userStates = new Map();
    this.setupCommands();
    
    // Handle polling errors to prevent crashes
    this.bot.on('polling_error', (error: Error) => {
      console.error('⚠️  Telegram polling error:', error.message);
      if (error.message.includes('409')) {
        console.error('⚠️  Multiple bot instances detected. Please stop all other instances.');
        console.error('   Run: pkill -f "ts-node src/index.ts" or pkill -f "nodemon"');
      }
    });
  }

  private setupCommands(): void {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from?.id.toString() || '';
      
      try {
        // Create or update user
        await this.userService.createUser({
          telegramId,
          username: msg.from?.username,
          firstName: msg.from?.first_name,
          lastName: msg.from?.last_name,
        });

        // Clean welcome message with WebApp button
        const welcomeMessage = `Welcome to Living To Peak - fitness for people who don't have time to waste. Intelligent training. Proven by real experience. **No hype, no bullshit. Just work.** Tap below to begin your journey.`;

        const keyboard: any = {
          inline_keyboard: [],
        };

        // Add WebApp button if frontend URL is configured
        if (env.TELEGRAM_FRONTEND_URL) {
          keyboard.inline_keyboard.push([
            {
              text: '🚀 Launch App',
              web_app: {
                url: env.TELEGRAM_FRONTEND_URL,
              },
            },
          ]);
        }

        await this.bot.sendMessage(chatId, welcomeMessage, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
      } catch (error) {
        console.error('Error in /start command:', error);
        await this.bot.sendMessage(chatId, '❌ An error occurred. Please try again.');
      }
    });

    // Setup command
    this.bot.onText(/\/setup/, async (msg) => {
      await this.handleSetupProfile(msg);
    });

    // Generate plan command
    this.bot.onText(/\/generate/, async (msg) => {
      await this.handleGeneratePlan(msg);
    });

    // My workouts command
    this.bot.onText(/\/workouts/, async (msg) => {
      await this.handleMyWorkouts(msg);
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(
        chatId,
        `📖 Available Commands:\n\n` +
        `/start - Start the bot\n` +
        `/setup - Configure your fitness profile\n` +
        `/generate - Generate a new workout plan\n` +
        `/workouts - View your upcoming workouts\n` +
        `/help - Show this help message`
      );
    });

    // Handle callback queries
    this.bot.on('callback_query', async (query) => {
      const chatId = query.message?.chat.id;
      const data = query.data;

      if (!chatId) return;

      try {
        if (data === 'setup_profile') {
          await this.handleSetupProfile(query.message!);
        } else if (data === 'generate_plan') {
          await this.handleGeneratePlan(query.message!);
        } else if (data === 'my_workouts') {
          await this.handleMyWorkouts(query.message!);
        } else if (data?.startsWith('complete_workout_')) {
          const workoutId = data.replace('complete_workout_', '');
          await this.handleCompleteWorkout(chatId, workoutId);
        } else if (data?.startsWith('level_')) {
          await this.handleFitnessLevelSelection(chatId, data);
        } else if (data?.startsWith('goal_')) {
          await this.handleGoalSelection(chatId, data);
        } else if (data?.startsWith('day_')) {
          await this.handleDaySelection(chatId, data);
        } else if (data === 'days_done') {
          await this.handleDaysComplete(chatId);
        } else if (data?.startsWith('duration_')) {
          await this.handleDurationSelection(chatId, data);
        } else if (data?.startsWith('equipment_')) {
          await this.handleEquipmentSelection(chatId, data);
        } else if (data === 'equipment_done') {
          await this.handleEquipmentComplete(chatId);
        } else if (data === 'no_injuries') {
          await this.handleInjuriesComplete(chatId, 'none');
        } else if (data === 'skip_injuries') {
          await this.handleInjuriesComplete(chatId, '');
        }

        await this.bot.answerCallbackQuery(query.id);
      } catch (error) {
        console.error('Error handling callback query:', error);
        await this.bot.answerCallbackQuery(query.id, { text: '❌ Error occurred' });
      }
    });

    // Handle text messages for injuries input
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;

      if (!userId || !msg.text) return;

      const state = this.userStates.get(userId);

      // Check if user is in injuries step and sent text
      if (state && state.step === 'injuries' && !msg.text.startsWith('/')) {
        await this.handleInjuriesComplete(chatId, msg.text);
      }
    });
  }

  private async handleSetupProfile(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;

    if (!userId) return;

    // Initialize user state
    this.userStates.set(userId, {
      step: 'fitness_level',
      data: {},
    });

    await this.bot.sendMessage(
      chatId,
      `⚙️ Let's set up your fitness profile!\n\n` +
      `Step 1/6: Please select your fitness level:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🟢 Beginner', callback_data: 'level_beginner' }],
            [{ text: '🟡 Intermediate', callback_data: 'level_intermediate' }],
            [{ text: '🔴 Advanced', callback_data: 'level_advanced' }],
          ],
        },
      }
    );
  }

  private async handleFitnessLevelSelection(chatId: number, data: string): Promise<void> {
    const userId = chatId; // In Telegram, chatId for private chats is the user ID
    const state = this.userStates.get(userId);

    if (!state) return;

    const level = data.replace('level_', '') as FitnessLevel;
    state.data.fitnessLevel = level;
    state.step = 'goal';

    await this.bot.sendMessage(
      chatId,
      `✅ Great! Fitness level set to: ${level}\n\n` +
      `Step 2/6: What's your primary fitness goal?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔥 Lose Weight', callback_data: 'goal_lose_weight' }],
            [{ text: '💪 Build Muscle', callback_data: 'goal_build_muscle' }],
            [{ text: '🏃 Increase Endurance', callback_data: 'goal_increase_endurance' }],
            [{ text: '⚡ Strength Training', callback_data: 'goal_strength_training' }],
            [{ text: '🎯 General Fitness', callback_data: 'goal_general_fitness' }],
          ],
        },
      }
    );
  }

  private async handleGoalSelection(chatId: number, data: string): Promise<void> {
    const userId = chatId;
    const state = this.userStates.get(userId);

    if (!state) return;

    const goal = data.replace('goal_', '') as FitnessGoal;
    state.data.primaryGoal = goal;
    state.step = 'days';
    state.data.preferredWorkoutDays = [];

    await this.bot.sendMessage(
      chatId,
      `✅ Goal set: ${goal.replace(/_/g, ' ')}\n\n` +
      `Step 3/6: Which days would you like to work out?\n` +
      `(Select all that apply, then click Done)`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📅 Monday', callback_data: 'day_monday' },
              { text: '📅 Tuesday', callback_data: 'day_tuesday' },
            ],
            [
              { text: '📅 Wednesday', callback_data: 'day_wednesday' },
              { text: '📅 Thursday', callback_data: 'day_thursday' },
            ],
            [
              { text: '📅 Friday', callback_data: 'day_friday' },
              { text: '📅 Saturday', callback_data: 'day_saturday' },
            ],
            [{ text: '📅 Sunday', callback_data: 'day_sunday' }],
            [{ text: '✅ Done', callback_data: 'days_done' }],
          ],
        },
      }
    );
  }

  private async handleDaySelection(chatId: number, data: string): Promise<void> {
    const userId = chatId;
    const state = this.userStates.get(userId);

    if (!state || !state.data.preferredWorkoutDays) return;

    const day = data.replace('day_', '');

    // Toggle day selection
    const index = state.data.preferredWorkoutDays.indexOf(day);
    if (index > -1) {
      state.data.preferredWorkoutDays.splice(index, 1);
    } else {
      state.data.preferredWorkoutDays.push(day);
    }

    const selectedDays = state.data.preferredWorkoutDays.length > 0
      ? state.data.preferredWorkoutDays.join(', ')
      : 'None';

    await this.bot.sendMessage(
      chatId,
      `📅 Selected days: ${selectedDays}\n\n` +
      `Keep selecting or click Done when finished.`
    );
  }

  private async handleDaysComplete(chatId: number): Promise<void> {
    const userId = chatId;
    const state = this.userStates.get(userId);

    if (!state || !state.data.preferredWorkoutDays || state.data.preferredWorkoutDays.length === 0) {
      await this.bot.sendMessage(chatId, '⚠️ Please select at least one workout day.');
      return;
    }

    state.step = 'duration';

    await this.bot.sendMessage(
      chatId,
      `✅ Workout days set!\n\n` +
      `Step 4/6: How long do you want each workout to be?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⏱️ 20 minutes', callback_data: 'duration_20' }],
            [{ text: '⏱️ 30 minutes', callback_data: 'duration_30' }],
            [{ text: '⏱️ 45 minutes', callback_data: 'duration_45' }],
            [{ text: '⏱️ 60 minutes', callback_data: 'duration_60' }],
            [{ text: '⏱️ 90 minutes', callback_data: 'duration_90' }],
          ],
        },
      }
    );
  }

  private async handleDurationSelection(chatId: number, data: string): Promise<void> {
    const userId = chatId;
    const state = this.userStates.get(userId);

    if (!state) return;

    const duration = parseInt(data.replace('duration_', ''));
    state.data.preferredDuration = duration;
    state.step = 'equipment';
    state.data.availableEquipment = [];

    await this.bot.sendMessage(
      chatId,
      `✅ Duration set: ${duration} minutes\n\n` +
      `Step 5/6: What equipment do you have available?\n` +
      `(Select all that apply, then click Done)`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏋️ Dumbbells', callback_data: 'equipment_dumbbells' }],
            [{ text: '🏋️ Barbell', callback_data: 'equipment_barbell' }],
            [{ text: '🎽 Resistance Bands', callback_data: 'equipment_resistance_bands' }],
            [{ text: '🏃 Treadmill', callback_data: 'equipment_treadmill' }],
            [{ text: '🚴 Stationary Bike', callback_data: 'equipment_bike' }],
            [{ text: '💺 Bench', callback_data: 'equipment_bench' }],
            [{ text: '🤸 Pull-up Bar', callback_data: 'equipment_pullup_bar' }],
            [{ text: '⭕ Kettlebell', callback_data: 'equipment_kettlebell' }],
            [{ text: '🚫 No Equipment', callback_data: 'equipment_none' }],
            [{ text: '✅ Done', callback_data: 'equipment_done' }],
          ],
        },
      }
    );
  }

  private async handleEquipmentSelection(chatId: number, data: string): Promise<void> {
    const userId = chatId;
    const state = this.userStates.get(userId);

    if (!state || !state.data.availableEquipment) return;

    const equipment = data.replace('equipment_', '');

    // If "none" is selected, clear all others
    if (equipment === 'none') {
      state.data.availableEquipment = ['none'];
    } else {
      // Remove "none" if other equipment is selected
      const noneIndex = state.data.availableEquipment.indexOf('none');
      if (noneIndex > -1) {
        state.data.availableEquipment.splice(noneIndex, 1);
      }

      // Toggle equipment selection
      const index = state.data.availableEquipment.indexOf(equipment);
      if (index > -1) {
        state.data.availableEquipment.splice(index, 1);
      } else {
        state.data.availableEquipment.push(equipment);
      }
    }

    const selectedEquipment = state.data.availableEquipment.length > 0
      ? state.data.availableEquipment.join(', ')
      : 'None selected';

    await this.bot.sendMessage(
      chatId,
      `🏋️ Selected equipment: ${selectedEquipment}\n\n` +
      `Keep selecting or click Done when finished.`
    );
  }

  private async handleEquipmentComplete(chatId: number): Promise<void> {
    const userId = chatId;
    const state = this.userStates.get(userId);

    if (!state) return;

    // Default to bodyweight if no equipment selected
    if (!state.data.availableEquipment || state.data.availableEquipment.length === 0) {
      state.data.availableEquipment = ['bodyweight'];
    }

    state.step = 'injuries';

    await this.bot.sendMessage(
      chatId,
      `✅ Equipment preferences saved!\n\n` +
      `Step 6/6: Do you have any injuries or limitations?\n\n` +
      `Type your answer or click a button below:`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ No injuries', callback_data: 'no_injuries' }],
            [{ text: '⏭️ Skip this step', callback_data: 'skip_injuries' }],
          ],
        },
      }
    );
  }

  private async handleInjuriesComplete(chatId: number, injuries: string): Promise<void> {
    const userId = chatId;
    const state = this.userStates.get(userId);
    const telegramId = userId.toString();

    if (!state) return;

    state.data.injuries = injuries === 'none' ? '' : injuries;
    state.step = 'complete';

    try {
      // Update user profile
      await this.userService.updateProfile(telegramId, state.data);

      // Clear state
      this.userStates.delete(userId);

      await this.bot.sendMessage(
        chatId,
        `🎉 Profile setup complete!\n\n` +
        `📋 Your Profile:\n` +
        `• Fitness Level: ${state.data.fitnessLevel}\n` +
        `• Goal: ${state.data.primaryGoal?.replace(/_/g, ' ')}\n` +
        `• Workout Days: ${state.data.preferredWorkoutDays?.join(', ')}\n` +
        `• Duration: ${state.data.preferredDuration} minutes\n` +
        `• Equipment: ${state.data.availableEquipment?.join(', ')}\n` +
        `• Injuries: ${state.data.injuries || 'None'}\n\n` +
        `You can now generate your personalized workout plan!\n` +
        `Use /generate to get started.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '💪 Generate Workout Plan', callback_data: 'generate_plan' }],
            ],
          },
        }
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      await this.bot.sendMessage(
        chatId,
        `❌ Failed to save profile. Please try again with /setup`
      );
      this.userStates.delete(userId);
    }
  }

  private async handleGeneratePlan(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id.toString() || '';

    try {
      // Check if profile is complete
      const isComplete = await this.userService.isProfileComplete(telegramId);
      
      if (!isComplete) {
        await this.bot.sendMessage(
          chatId,
          `❌ Please complete your fitness profile first!\n\n` +
          `Use /setup to configure your profile.`
        );
        return;
      }

      await this.bot.sendMessage(chatId, `🤖 Generating your personalized workout plan...\n\nThis may take a moment.`);

      const user = await this.userService.findByTelegramId(telegramId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const plan = await this.workoutPlanService.generateAIPlan(user, 2);

      await this.bot.sendMessage(
        chatId,
        `✅ Your workout plan is ready!\n\n` +
        `📋 **${plan.name}**\n` +
        `${plan.description}\n\n` +
        `📅 Total Workouts: ${plan.totalWorkouts}\n` +
        `📆 Duration: ${plan.metadata?.preferences?.duration} minutes per session\n\n` +
        `Use /workouts to see your upcoming workouts!`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error generating workout plan:', error);
      await this.bot.sendMessage(
        chatId,
        `❌ Failed to generate workout plan.\n\n` +
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async handleMyWorkouts(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id.toString() || '';

    try {
      const user = await this.userService.findByTelegramId(telegramId);
      
      if (!user) {
        throw new Error('User not found');
      }

      const workouts = await this.workoutPlanService.getUpcomingWorkouts(user.id, 7);

      if (workouts.length === 0) {
        await this.bot.sendMessage(
          chatId,
          `📅 You don't have any upcoming workouts.\n\n` +
          `Use /generate to create a workout plan!`
        );
        return;
      }

      let message = `📅 **Your Upcoming Workouts:**\n\n`;
      
      for (const workout of workouts) {
        const date = new Date(workout.scheduledDate);
        const dateStr = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        });
        
        message += `🏋️ **${workout.name}**\n`;
        message += `📆 ${dateStr}\n`;
        message += `⏱️ ${workout.duration} minutes | 🎯 ${workout.focus}\n`;
        message += `💪 ${workout.exercises.length} exercises\n\n`;
      }

      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('Error fetching workouts:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to fetch workouts.');
    }
  }

  private async handleCompleteWorkout(chatId: number, workoutId: string): Promise<void> {
    try {
      await this.workoutPlanService.markWorkoutComplete(workoutId);
      await this.bot.sendMessage(chatId, `✅ Great job! Workout marked as complete!`);
    } catch (error) {
      console.error('Error completing workout:', error);
      await this.bot.sendMessage(chatId, '❌ Failed to mark workout as complete.');
    }
  }

  public start(): void {
    console.log('✅ Telegram bot is running...');
  }

  public stop(): void {
    this.bot.stopPolling();
    console.log('🛑 Telegram bot stopped');
  }
}

