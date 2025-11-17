import OpenAI from 'openai';
import { env } from '../config/env';
import { LibraryWorkoutService } from './LibraryWorkoutService';
import { WorkoutResultService } from './WorkoutResultService';
import { WorkoutHistoryAnalyzer } from './WorkoutHistoryAnalyzer';

export interface SingleWorkoutRequest {
  timeChoice: 'quick' | 'classic' | 'long';
  trainingType: 'lifting' | 'gymnastics' | 'cardio' | 'mixed';
  goalType: 'strength' | 'conditioning' | 'skill' | 'balanced';
  gearType: 'bodyweight' | 'dumbbells' | 'fullgym';
  userId?: string; // To fetch user preferences
  fitnessLevel?: string;
}

export interface WorkoutBlock {
  blockType: 'warm-up' | 'skill' | 'wod' | 'cooldown';
  blockName: string;
  duration: number;
  wodFormat?: string;
  description?: string;
  exercises: Array<{
    name: string;
    description?: string;
    type?: string;
    sets?: number;
    reps?: string | number;
    duration?: number;
    weight?: string;
    restTime?: number;
    instructions: string;
    muscleGroups?: string[];
    order: number;
  }>;
}

export interface GeneratedSingleWorkout {
  name: string;
  description: string;
  duration: number;
  focus: string;
  blocks: WorkoutBlock[];
  // Keep exercises for backward compatibility
  exercises?: Array<any>;
}

export class SingleWorkoutService {
  private openai: OpenAI;
  private resultService: WorkoutResultService;
  private libraryService: LibraryWorkoutService;
  private historyAnalyzer: WorkoutHistoryAnalyzer;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    this.resultService = new WorkoutResultService();
    this.libraryService = new LibraryWorkoutService();
    this.historyAnalyzer = new WorkoutHistoryAnalyzer();
  }

  async generateSingleWorkout(request: SingleWorkoutRequest): Promise<GeneratedSingleWorkout> {
    try {
      // Fetch user feedback and workout history if userId provided
      let feedbackContext = null;
      let workoutHistory = null;
      
      if (request.userId) {
        try {
          feedbackContext = await this.resultService.getUserFeedbackSummary(request.userId, 10);
          console.log('📊 User feedback loaded:', {
            liked: feedbackContext.likedWorkouts.length,
            disliked: feedbackContext.dislikedWorkouts.length,
          });
        } catch (err) {
          console.log('No previous feedback available');
        }

        try {
          workoutHistory = await this.resultService.getRecentWorkoutHistory(request.userId, 7);
          console.log('📅 Workout history loaded:', {
            totalWorkouts: workoutHistory.totalWorkoutsInPeriod,
            uniqueMovements: Object.keys(workoutHistory.movementFrequency).length,
          });
        } catch (err) {
          console.log('No previous workout history available');
        }

        // Get enhanced CrossFit methodology analysis
        try {
          const crossFitAnalysis = await this.historyAnalyzer.analyzeHistory(request.userId, 7);
          console.log('📊 CrossFit methodology analysis:', {
            timeDomains: crossFitAnalysis.timeDomainBalance,
            energySystems: crossFitAnalysis.energySystemBalance,
            modalities: crossFitAnalysis.modalityBalance,
          });
          
          // Get library workouts for AI inspiration
          const libraryExamples = await this.libraryService.getFormattedForAI(6);
          
          const prompt = this.buildSingleWorkoutPrompt(
            request, 
            feedbackContext, 
            workoutHistory, 
            libraryExamples,
            crossFitAnalysis
          );
          
          // Log preferences without fitnessLevel
          const { fitnessLevel, ...loggedPreferences } = request;
          console.log('🏋️ Generating WOD with preferences:', loggedPreferences);
          console.log('📚 Including WOD examples from library database...');
          
          const completion = await this.openai.chat.completions.create({
            model: env.OPENAI_MODEL,
            messages: [
              {
                role: 'system',
                content: `You are an expert CrossFit coach specializing in creating engaging, challenging WODs (Workouts of the Day).

Your expertise:
- Designing varied, high-intensity functional fitness workouts
- Combining gymnastics, weightlifting, and metabolic conditioning
- Creating AMRAPs, EMOMs, For Time, Chipper, and Tabata workouts
- Scaling appropriately while maintaining intensity
- Using proper CrossFit terminology and movement standards

Always create workouts that are:
- Fun and engaging
- Appropriately challenging
- Safe and scalable
- Varied in movement patterns
- Time-efficient and effective`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7, // Reduced for more consistency while maintaining variety
            max_tokens: 3000,
            response_format: { type: 'json_object' },
          });

          const responseContent = completion.choices[0]?.message?.content;
          if (!responseContent) {
            throw new Error('No response from OpenAI');
          }

          const workout = this.parseWorkoutResponse(responseContent);
          return workout;
        } catch (err) {
          console.log('CrossFit analysis not available, using basic history');
          
          // Get library workouts for AI inspiration
          const libraryExamples = await this.libraryService.getFormattedForAI(6);
          
          const prompt = this.buildSingleWorkoutPrompt(
            request, 
            feedbackContext, 
            workoutHistory, 
            libraryExamples,
            undefined
          );
          
          // Log preferences without fitnessLevel
          const { fitnessLevel, ...loggedPreferences } = request;
          console.log('🏋️ Generating WOD with preferences:', loggedPreferences);
          console.log('📚 Including WOD examples from library database...');
          
          const completion = await this.openai.chat.completions.create({
            model: env.OPENAI_MODEL,
            messages: [
              {
                role: 'system',
                content: `You are an expert CrossFit coach specializing in creating engaging, challenging WODs (Workouts of the Day).

Your expertise:
- Designing varied, high-intensity functional fitness workouts
- Combining gymnastics, weightlifting, and metabolic conditioning
- Creating AMRAPs, EMOMs, For Time, Chipper, and Tabata workouts
- Scaling appropriately while maintaining intensity
- Using proper CrossFit terminology and movement standards

Always create workouts that are:
- Fun and engaging
- Appropriately challenging
- Safe and scalable
- Varied in movement patterns
- Time-efficient and effective`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 3000,
            response_format: { type: 'json_object' },
          });

          const responseContent = completion.choices[0]?.message?.content;
          if (!responseContent) {
            throw new Error('No response from OpenAI');
          }

          const workout = this.parseWorkoutResponse(responseContent);
          return workout;
        }
      } else {
        // No userId - generate without history
        const libraryExamples = await this.libraryService.getFormattedForAI(6);
        
        const prompt = this.buildSingleWorkoutPrompt(
          request, 
          undefined, 
          undefined, 
          libraryExamples,
          undefined
        );
      
      // Log preferences without fitnessLevel
      const { fitnessLevel: __, ...loggedPreferences } = request;
      console.log('🏋️ Generating WOD with preferences:', loggedPreferences);
        console.log('📚 Including WOD examples from library database...');
      
      const completion = await this.openai.chat.completions.create({
        model: env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert CrossFit coach specializing in creating engaging, challenging WODs (Workouts of the Day).

Your expertise:
- Designing varied, high-intensity functional fitness workouts
- Combining gymnastics, weightlifting, and metabolic conditioning
- Creating AMRAPs, EMOMs, For Time, Chipper, and Tabata workouts
- Scaling appropriately while maintaining intensity
- Using proper CrossFit terminology and movement standards

Always create workouts that are:
- Fun and engaging
- Appropriately challenging
- Safe and scalable
- Varied in movement patterns
- Time-efficient and effective`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
          temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      const workout = this.parseWorkoutResponse(responseContent);
      return workout;
      }
    } catch (error: any) {
      console.error('Error generating single workout:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
      });
      throw new Error(error.message || 'Failed to generate workout');
    }
  }

  private buildSingleWorkoutPrompt(
    request: SingleWorkoutRequest, 
    feedbackContext?: any, 
    workoutHistory?: any, 
    libraryExamples?: string,
    crossFitAnalysis?: any
  ): string {
    const { timeChoice, trainingType, goalType, gearType } = request;

    const timeMap = {
      quick: { 
        totalDuration: 60,
        wodDuration: 10,
        description: 'Short, intense benchmark-style WOD (10-15 min main workout)',
        example: 'Like "Fran" - quick, brutal, and effective'
      },
      classic: { 
        totalDuration: 60,
        wodDuration: 25,
        description: 'Classic WOD session (20-30 min main workout)',
        example: 'Standard CrossFit programming with good volume'
      },
      long: { 
        totalDuration: 60,
        wodDuration: 40,
        description: 'Long grinder workout (40+ min main workout)',
        example: 'Like "Murph" - endurance test and mental challenge'
      },
    };

    const trainingMap = {
      lifting: 'Weightlifting focus (barbell movements, strength work, Olympic lifts)',
      gymnastics: 'Gymnastics/Bodyweight focus (pull-ups, push-ups, muscle-ups, handstands, core)',
      cardio: 'Cardio/Conditioning focus (running, rowing, assault bike, burpees, high-rep movements)',
      mixed: 'Classic CrossFit blend (mix of all three domains: gymnastics, weightlifting, metabolic conditioning)',
    };

    const goalMap = {
      strength: 'Strength & Power - focus on heavy lifts, lower reps, skill practice',
      conditioning: 'High-intensity conditioning - go all out, max effort, cardio endurance',
      skill: 'Technique & Skill mastery - practice complex movements with good form',
      balanced: 'Balanced training - combination of strength, skill, and conditioning',
    };

    const gearMap = {
      bodyweight: 'Bodyweight only - no equipment needed (push-ups, squats, burpees, running, etc.)',
      dumbbells: 'Dumbbells and/or kettlebells available (plus bodyweight movements)',
      fullgym: 'Full CrossFit gym (barbell, plates, pull-up bar, Concept2 rowing machine, Concept2 bike erg, Concept2 ski erg, assault bike, echo bike, box, etc.) - USE THIS VARIETY! When including mono-structural work, prioritize using rowing, bike erg, ski erg, and assault bike as much as running to maintain variety.',
    };

    const time = timeMap[timeChoice];
    const training = trainingMap[trainingType];
    const goal = goalMap[goalType];
    const gear = gearMap[gearType];

    return `Create ONE single CrossFit-style training session based on these preferences:

**User's Choices:**
- Workout Intensity: ${time.description} (${time.example})
- Training Style: ${training}
- Today's Goal: ${goal}
- Available Equipment: ${gear}

**CRITICAL RULES:**
1. TOTAL SESSION = 60 MINUTES (Always!)
2. Include RX/Scaled/Beginner options and form cues ONLY in the WOD block. Do NOT include scaling options or form cues in Warm-up or Cool-down blocks.
3. Use WOD methodology from the examples provided below
4. Consider user's feedback to create workouts they'll enjoy

${feedbackContext && (feedbackContext.likedWorkouts.length > 0 || feedbackContext.dislikedWorkouts.length > 0) ? `
**USER'S FEEDBACK HISTORY (Weighted by Recency):**

${feedbackContext.likedWorkouts.length > 0 ? `
✅ **LIKED Workouts** (Recent feedback weighted more heavily):
${feedbackContext.likedWorkouts.slice(0, 8).map((item: any) => {
  const name = typeof item === 'string' ? item : item.name;
  const weight = typeof item === 'string' ? 1.0 : item.weight;
  const weightLabel = weight >= 1.5 ? '🔥 RECENT' : weight >= 1.0 ? '✅ Recent' : '📅 Older';
  return `- ${name} (${weightLabel}, weight: ${weight.toFixed(2)})`;
}).join('\n')}
→ **CRITICAL:** Recent liked workouts (high weight) indicate CURRENT preferences.
→ Study recent patterns (last 1-3 days) more than older feedback.
→ Don't copy exactly, but prioritize similar movement patterns and formats from RECENT workouts.
→ Older feedback (low weight) is less relevant than recent feedback.
` : ''}

${feedbackContext.dislikedWorkouts.length > 0 ? `
❌ **DISLIKED Workouts** (Recent feedback weighted more heavily):
${feedbackContext.dislikedWorkouts.slice(0, 8).map((item: any) => {
  const name = typeof item === 'string' ? item : item.name;
  const weight = typeof item === 'string' ? 1.0 : item.weight;
  const weightLabel = weight >= 1.5 ? '🔥 RECENT' : weight >= 1.0 ? '✅ Recent' : '📅 Older';
  return `- ${name} (${weightLabel}, weight: ${weight.toFixed(2)})`;
}).join('\n')}
→ **CRITICAL:** Recent disliked workouts (high weight) should be AVOIDED more than older ones.
→ Avoid formats/movements from recent disliked workouts (last 1-3 days).
→ Older disliked workouts are less relevant - don't over-avoid based on old feedback.
→ Still vary combinations, but give more weight to recent negative feedback.
` : ''}

**FEEDBACK WEIGHTING SYSTEM:**
- 🔥 Last 1 day: Weight 2.0 (HIGHEST - most important)
- ✅ Last 2 days: Weight 1.5 (High priority)
- ✅ Last 3 days: Weight 1.2 (Medium-high)
- 📅 Last 5 days: Weight 1.0 (Normal)
- 📅 Last 7 days: Weight 0.8 (Lower priority)
- 📅 7+ days: Weight 0.5 (LOWEST - least important)

**IMPORTANT:** Recent feedback (last 1-3 days) reflects CURRENT preferences and should heavily influence today's workout. Older feedback is less relevant.
` : ''}

${crossFitAnalysis && crossFitAnalysis.recentWorkouts.length > 0 ? `
**CROSSFIT METHODOLOGY ANALYSIS (Last 7 days):**

**Time Domain Balance (Energy Systems):**
${crossFitAnalysis.timeDomainBalance.short > 0 ? `- Short/Phosphagen: ${crossFitAnalysis.timeDomainBalance.short}x (explosive, <10min)` : ''}
${crossFitAnalysis.timeDomainBalance.medium > 0 ? `- Medium/Glycolytic: ${crossFitAnalysis.timeDomainBalance.medium}x (sustained, 10-20min)` : ''}
${crossFitAnalysis.timeDomainBalance.long > 0 ? `- Long/Oxidative: ${crossFitAnalysis.timeDomainBalance.long}x (endurance, >20min)` : ''}

**Modality Balance (Movement Domains):**
${crossFitAnalysis.modalityBalance.gymnastics > 0 ? `- Gymnastics: ${crossFitAnalysis.modalityBalance.gymnastics}x` : ''}
${crossFitAnalysis.modalityBalance.weightlifting > 0 ? `- Weightlifting: ${crossFitAnalysis.modalityBalance.weightlifting}x` : ''}
${crossFitAnalysis.modalityBalance.monoStructural > 0 ? `- Mono-Structural (Cardio): ${crossFitAnalysis.modalityBalance.monoStructural}x` : ''}
${crossFitAnalysis.modalityBalance.mixed > 0 ? `- Mixed (2+ domains): ${crossFitAnalysis.modalityBalance.mixed}x` : ''}

**Movement Pattern Balance:**
${crossFitAnalysis.movementPatternBalance.pulling > 0 ? `- Pulling: ${crossFitAnalysis.movementPatternBalance.pulling}x (pull-ups, rows, deadlifts, cleans)` : ''}
${crossFitAnalysis.movementPatternBalance.pushing > 0 ? `- Pushing: ${crossFitAnalysis.movementPatternBalance.pushing}x (push-ups, presses, thrusters, burpees)` : ''}
${crossFitAnalysis.movementPatternBalance.lowerBody > 0 ? `- Lower Body: ${crossFitAnalysis.movementPatternBalance.lowerBody}x (squats, lunges, box jumps)` : ''}
${crossFitAnalysis.movementPatternBalance.core > 0 ? `- Core: ${crossFitAnalysis.movementPatternBalance.core}x (sit-ups, toes-to-bar, GHD)` : ''}
${crossFitAnalysis.movementPatternBalance.fullBody > 0 ? `- Full Body: ${crossFitAnalysis.movementPatternBalance.fullBody}x (thrusters, burpees, complexes)` : ''}

**Intensity Balance:**
${crossFitAnalysis.intensityBalance.heavy > 0 ? `- Heavy: ${crossFitAnalysis.intensityBalance.heavy}x (strength focus, low reps, heavy weights)` : ''}
${crossFitAnalysis.intensityBalance.moderate > 0 ? `- Moderate: ${crossFitAnalysis.intensityBalance.moderate}x (balanced, mixed)` : ''}
${crossFitAnalysis.intensityBalance.light > 0 ? `- Light: ${crossFitAnalysis.intensityBalance.light}x (conditioning focus, high reps, bodyweight)` : ''}
${crossFitAnalysis.intensityBalance.skill > 0 ? `- Skill: ${crossFitAnalysis.intensityBalance.skill}x (technique practice, skill work)` : ''}

**Recent Workouts:**
${crossFitAnalysis.recentWorkouts.slice(0, 5).map((w: any, i: number) => `
${i + 1}. "${w.workoutName}" (${w.daysAgo} days ago)
   - Type: ${w.workoutType}
   - Time Domain: ${w.timeDomain || 'N/A'}
   - Energy System: ${w.energySystem || 'N/A'}
   - Primary Modality: ${w.primaryModality || 'mixed'}
   - Movement Patterns: ${w.movementPatterns?.join(', ') || 'N/A'}
   - Intensity: ${w.intensity || 'moderate'}
   - Movements: ${w.movements?.slice(0, 5).join(', ') || 'N/A'}${w.movements && w.movements.length > 5 ? ` (+ ${w.movements.length - 5} more)` : ''}
   - Feedback: ${w.liked === true ? '👍 Liked' : w.liked === false ? '👎 Disliked' : 'No feedback'}
`).join('')}

**Movement Frequency (Avoid Overtraining):**
${Object.entries(crossFitAnalysis.movementFrequency)
  .sort((a: any, b: any) => b[1] - a[1])
  .slice(0, 10)
  .map(([movement, count]: [string, any]) => {
    const avoid = count >= 2 ? ' ⚠️ AVOID' : '';
    return `- ${movement}: ${count}x this week${avoid}`;
  })
  .join('\n')}

**CROSSFIT PROGRAMMING PRINCIPLES FOR TODAY:**

🎯 **CRITICAL: Balance All Energy Systems & Modalities**

Based on CrossFit methodology, you MUST balance:

1. **TIME DOMAINS (Energy Systems):**
   - Phosphagen (short, explosive): Used ${crossFitAnalysis.timeDomainBalance.short}x this week
   - Glycolytic (medium, sustained): Used ${crossFitAnalysis.timeDomainBalance.medium}x this week
   - Oxidative (long, endurance): Used ${crossFitAnalysis.timeDomainBalance.long}x this week
   
   **Recommendation:** Today should emphasize ${crossFitAnalysis.recommendations.suggestedTimeDomain ? `**${crossFitAnalysis.recommendations.suggestedTimeDomain}** time domain` : 'varied time domain'} to balance the energy systems.

2. **MODALITY BALANCE (Movement Domains):**
   - Gymnastics: ${crossFitAnalysis.modalityBalance.gymnastics}x this week
   - Weightlifting: ${crossFitAnalysis.modalityBalance.weightlifting}x this week
   - Mono-Structural (running, rowing, biking): ${crossFitAnalysis.modalityBalance.monoStructural}x this week
   - Mixed: ${crossFitAnalysis.modalityBalance.mixed}x this week
   
   **Recommendation:** ${crossFitAnalysis.recommendations.suggestedModality ? `Consider emphasizing **${crossFitAnalysis.recommendations.suggestedModality}** modality today` : 'Use balanced modality mix'} to ensure all domains are trained.

3. **MOVEMENT PATTERN BALANCE:**
   - Pulling: ${crossFitAnalysis.movementPatternBalance.pulling}x this week
   - Pushing: ${crossFitAnalysis.movementPatternBalance.pushing}x this week
   - Lower Body: ${crossFitAnalysis.movementPatternBalance.lowerBody}x this week
   - Core: ${crossFitAnalysis.movementPatternBalance.core}x this week
   - Full Body: ${crossFitAnalysis.movementPatternBalance.fullBody}x this week
   
   **Recommendation:** ${crossFitAnalysis.recommendations.suggestedMovementPattern ? `Consider emphasizing **${crossFitAnalysis.recommendations.suggestedMovementPattern}** pattern today` : 'Use balanced movement patterns'} to avoid overtraining specific muscle groups.

4. **INTENSITY BALANCE:**
   - Heavy: ${crossFitAnalysis.intensityBalance.heavy}x this week (strength days)
   - Moderate: ${crossFitAnalysis.intensityBalance.moderate}x this week (balanced)
   - Light: ${crossFitAnalysis.intensityBalance.light}x this week (conditioning days)
   - Skill: ${crossFitAnalysis.intensityBalance.skill}x this week (technique days)
   
   **Recommendation:** ${crossFitAnalysis.recommendations.suggestedIntensity ? `Consider **${crossFitAnalysis.recommendations.suggestedIntensity}** intensity today` : 'Use balanced intensity mix'} to ensure proper recovery and variety.

5. **MOVEMENT VARIATION:**
   ${crossFitAnalysis.recommendations.movementsToAvoid.length > 0 ? `
   **AVOID these movements (overused this week):**
   ${crossFitAnalysis.recommendations.movementsToAvoid.map((m: string) => `- ${m}`).join('\n')}
   ` : ''}
   
   ${crossFitAnalysis.recommendations.movementsToConsider.length > 0 ? `
   **CONSIDER these movements (underused):**
   ${crossFitAnalysis.recommendations.movementsToConsider.slice(0, 5).map((m: string) => `- ${m}`).join('\n')}
   ` : ''}

6. **WORKOUT TYPE VARIATION:**
   - Last workout types: ${Object.keys(crossFitAnalysis.workoutTypeFrequency).join(', ') || 'None'}
   ${crossFitAnalysis.recommendations.suggestedWorkoutType ? `- Consider using: **${crossFitAnalysis.recommendations.suggestedWorkoutType}** format today` : ''}

**CROSSFIT PRINCIPLES TO APPLY:**
- **Constantly Varied**: Never repeat the same workout OR the same mono-structural movements
- **Functional Movements**: Multi-joint, compound movements
- **High Intensity**: Relative to individual capacity
- **Balance All Domains**: Gymnastics, Weightlifting, Mono-Structural (cardio)
- **Variety in Mono-Structural**: When using cardio machines, vary between running, rowing, bike erg, ski erg, and assault bike - don't default to running!
- **Balance All Energy Systems**: Phosphagen, Glycolytic, Oxidative
- **Balance Time Domains**: Short, medium, and long workouts

**IMPORTANT BALANCING RULES:** 
- **Time Domains**: If last workout was short → Consider medium or long today
- **Modalities**: If last workout was mono-structural heavy → Include gymnastics or weightlifting today
- **Movement Patterns**: If last workout was pulling heavy → Focus on pushing or lower body today
- **Intensity**: Don't do heavy days back-to-back; alternate heavy/light/moderate
- **Patterns**: Balance pulling vs pushing, upper vs lower body, core work
- **Mono-Structural Variety**: If last workout had running → Use rowing, bike erg, ski erg, or assault bike today! Vary machines - don't default to running!
- Always aim for BALANCE across all dimensions: time domains, modalities, movement patterns, and intensity

` : workoutHistory && workoutHistory.totalWorkoutsInPeriod > 0 ? `
**RECENT WORKOUT HISTORY (Last 7 days):**
${workoutHistory.recentWorkouts.map((w: any, i: number) => `
${i + 1}. "${w.workoutName}" (${w.daysAgo} days ago)
   - Type: ${w.workoutType}
   - Movements: ${w.movements?.slice(0, 5).join(', ') || 'N/A'}
   - Feedback: ${w.liked === true ? '👍 Liked' : w.liked === false ? '👎 Disliked' : 'No feedback'}
`).join('')}

**Movement Frequency:**
${Object.entries(workoutHistory.movementFrequency)
  .sort((a: any, b: any) => b[1] - a[1])
  .slice(0, 10)
  .map(([movement, count]: [string, any]) => `- ${movement}: ${count}x this week`)
  .join('\n')}

**Balance Principles:**
- Avoid movements used 2+ times this week
- Vary workout types from recent workouts
- Balance gymnastics, weightlifting, and cardio
` : ''}

**CRITICAL: BLOCK GENERATION LOGIC - ANALYZE WOD MOVEMENTS FIRST**

Before generating warm-up and cool-down blocks, you MUST:

1. **ANALYZE THE WOD MOVEMENTS**: Identify all primary movements in the WOD block you're creating
2. **MAP TO MUSCLE GROUPS & JOINTS**: Determine which muscles and joints are used
3. **GENERATE WARM-UP**: Mobilize and activate those specific muscles/joints
4. **GENERATE COOL-DOWN**: Stretch and mobilize those specific muscles/joints

**MOVEMENT ANALYSIS EXAMPLES:**

- **Thrusters** → Muscles: Quads, glutes, shoulders, core | Joints: Hips, knees, ankles, shoulders
- **Pull-ups** → Muscles: Lats, biceps, rear delts, core | Joints: Shoulders, elbows, scapula
- **Deadlifts** → Muscles: Hamstrings, glutes, lower back, core | Joints: Hips, knees, ankles, spine
- **Running/Rowing** → Muscles: Legs, calves, core, cardio | Joints: Hips, knees, ankles
- **Push-ups** → Muscles: Chest, triceps, shoulders, core | Joints: Shoulders, elbows
- **Squats** → Muscles: Quads, glutes, core | Joints: Hips, knees, ankles
- **Cleans/Snatches** → Muscles: Full body, posterior chain, shoulders | Joints: Hips, knees, ankles, shoulders, wrists
- **Burpees** → Muscles: Full body, cardio | Joints: Hips, knees, shoulders
- **Wall Balls** → Muscles: Legs, shoulders, core | Joints: Hips, knees, shoulders
- **Box Jumps** → Muscles: Quads, glutes, calves | Joints: Hips, knees, ankles
- **Toes-to-Bar** → Muscles: Core, lats, hip flexors | Joints: Hips, shoulders
- **Handstand Push-ups** → Muscles: Shoulders, triceps, core | Joints: Shoulders, elbows

**WARM-UP EXERCISE MAPPING:**

- **For pulling movements (pull-ups, rows, deadlifts)**: Arm circles, lat activation, rowing, band pull-aparts, cat-cow stretches
- **For pushing movements (push-ups, presses, thrusters)**: Arm circles, shoulder dislocates, push-up prep, wall angels
- **For squatting movements (squats, thrusters, wall balls)**: Air squats, leg swings, hip circles, ankle mobility
- **For running/rowing**: Easy run/row, leg swings, calf raises, hip circles
- **For Olympic lifts (cleans, snatches)**: PVC pass-throughs, overhead squats (light), hip mobility, shoulder mobility
- **For core movements (sit-ups, toes-to-bar)**: Cat-cow, dead bugs, bird dogs, hip circles

**COOL-DOWN STRETCH MAPPING:**

- **For pulling movements**: Lat stretch, chest stretch, bicep stretch, shoulder stretch
- **For pushing movements**: Shoulder stretch, chest stretch, tricep stretch, anterior delt stretch
- **For squatting movements**: Quad stretch, hamstring stretch, hip flexor stretch, calf stretch, glute stretch
- **For running/rowing**: Quad stretch, hamstring stretch, calf stretch, hip flexor stretch, IT band stretch
- **For Olympic lifts**: Shoulder stretch, hip flexor stretch, quad stretch, lat stretch, hip mobility
- **For core movements**: Hip flexor stretch, lower back stretch, hamstring stretch, glute stretch

Break down into these blocks:

**Block 1: WARM-UP (10 minutes) - MUST BE BASED ON WOD MOVEMENTS**

**CRITICAL WARM-UP GENERATION PROCESS:**

1. **First, identify WOD movements**: List all primary movements in the WOD block you're creating (e.g., "Thrusters, Pull-ups, Running")
2. **Map to muscle groups**: Determine which muscles/joints need warming up (e.g., "Quads, shoulders, lats, hips, knees, ankles")
3. **Select warm-up exercises**: Choose 2-3 dynamic movements that mobilize and activate those specific areas
4. **Generate warm-up**: Create a warm-up that directly prepares for the WOD movements

**WARM-UP REQUIREMENTS:**
- Provide a description that includes how long to do the warm-up and the format (e.g., "For Time: 5 rounds", "10 min AMRAP", "Complete 3 rounds")
- List movements in column format - one movement with reps per line (e.g., "50 jump rope", "10 arm circles each arm", "5 PVC pass-throughs")
- At most 2-3 simple movements in the exercises array, each with clear reps/duration
- **MUST mobilize and activate the specific muscles/joints used in the WOD**
- **MUST prepare for the specific movement patterns in the WOD** (e.g., if WOD has squats → include air squats in warm-up)
- CRITICAL: Include time/rounds format in the description (e.g., "5 Rounds For Time" or "10 min AMRAP")

**WARM-UP EXAMPLES BASED ON WOD:**

- **WOD: Thrusters + Pull-ups** → Warm-up: Air squats (hip/knee mobility), arm circles (shoulder mobility), lat activation (band pull-aparts or light rowing)
- **WOD: Deadlifts + Running** → Warm-up: Leg swings (hip mobility), easy run (cardio activation), hip circles (hip mobility), cat-cow (spine mobility)
- **WOD: Cleans + Push-ups** → Warm-up: PVC pass-throughs (shoulder mobility), hip circles (hip mobility), push-up prep (chest/shoulder activation), light rowing (posterior chain activation)
- **WOD: Burpees + Box Jumps** → Warm-up: Air squats (leg activation), arm circles (shoulder mobility), leg swings (hip mobility), light jumping (plyometric prep)

**Block 2: SKILL/STRENGTH WORK (15-20 minutes) - MUST BE BASED ON WOD MOVEMENTS AND GOAL TYPE** ${timeChoice === 'quick' ? '(IMPORTANT for short WODs!)' : ''}

**CRITICAL: SKILL/STRENGTH GENERATION PROCESS:**

1. **Analyze WOD movements**: Identify all primary movements in the WOD block you're creating (e.g., "Thrusters, Pull-ups, Cleans")
2. **Determine skill/strength needs**: 
   - Which movements need practice? (Complex movements like muscle-ups, handstands, Olympic lifts)
   - Which movements need strength building? (Heavy lifts, strict versions)
   - Which movements need technique work? (Olympic lifts, complex gymnastics)
3. **Select skill/strength work**: Choose exercises that prepare for WOD movements based on goal type
4. **Program sets/reps/weight**: Based on goal type, movement type, and training type
5. **Generate skill/strength block**: Create specific work for WOD preparation

**GOAL-SPECIFIC PROTOCOLS:**

${goalType === 'strength' ? `**STRENGTH GOAL (Your Current Goal):**
- **Intensity**: Work up to 80-90% 1RM (heavy weight)
- **Sets/Reps**: 3-5 sets of 1-5 reps (low reps, high weight)
- **Rest Periods**: 2-3 min between sets (adequate recovery for heavy lifting)
- **Progression**: Build to heavy single or double, practice WOD movements at heavy weight
- **Focus**: Strength building, power development, heavy lifting
- **Example**: If WOD has thrusters at 43kg, work up to 80-90% 1RM (e.g., build to 70-80kg for heavy singles)
- **Example**: If WOD has pull-ups, do 5 sets of 3-5 strict pull-ups (strength building)
- **Example**: If WOD has deadlifts, work up to heavy single or double at 80-90% 1RM

**MOVEMENT-SPECIFIC PROTOCOLS FOR STRENGTH GOAL:**
- **Olympic Lifts (Cleans, Snatches)**: Work up to 80-90% 1RM, practice complexes, 3-5 sets of 1-3 reps, rest 2-3 min
- **Powerlifting (Deadlifts, Squats, Presses)**: Work up to 80-90% 1RM, build to heavy single or double, 3-5 sets of 1-5 reps, rest 2-3 min
- **Gymnastics (Pull-ups, Muscle-ups)**: Practice strict versions for strength, 5 sets of 3-5 reps, rest 2-3 min
- **Accessory Work**: Target weak points, improve movement patterns, 3-4 sets of 5-8 reps, rest 1-2 min` : ''}

${goalType === 'skill' ? `**SKILL GOAL (Your Current Goal):**
- **Intensity**: Light to moderate (focus on technique, not intensity)
- **Sets/Reps**: 3-5 sets of 3-8 reps (moderate reps for skill practice)
- **Rest Periods**: 1-2 min between sets (moderate recovery)
- **Progression**: Practice complex movements, work on progressions (banded → kipping → strict)
- **Focus**: Technique work, skill development, movement mastery
- **Example**: If WOD has muscle-ups, practice muscle-up progressions (banded, jumping, strict)
- **Example**: If WOD has handstand push-ups, practice handstand holds and pike push-ups
- **Example**: If WOD has Olympic lifts, practice technique work (hang positions, receiving positions)

**MOVEMENT-SPECIFIC PROTOCOLS FOR SKILL GOAL:**
- **Olympic Lifts (Cleans, Snatches)**: Practice technique work, hang positions, receiving positions, complexes, 3-5 sets of 1-3 reps, rest 1-2 min
- **Gymnastics (Pull-ups, Muscle-ups, Handstands)**: Practice strict versions, work on progressions (banded → kipping → strict), skill work, 3-5 sets of 3-8 reps, rest 1-2 min
- **Complex Movements**: Practice movement patterns, technique work, progressions, 3-4 sets of 3-6 reps, rest 1-2 min
- **Accessory Work**: Target weak points, improve movement patterns, 2-3 sets of 8-12 reps, rest 1 min` : ''}

${goalType === 'conditioning' ? `**CONDITIONING GOAL (Your Current Goal):**
- **Intensity**: Light (conserve energy for WOD)
- **Sets/Reps**: 2-3 sets of 5-10 reps (light work, not heavy strength)
- **Rest Periods**: 30-60 sec between sets (minimal recovery)
- **Progression**: Light skill work, mobility, activation, movement prep
- **Focus**: Movement preparation, mobility, activation (NOT heavy strength)
- **Example**: If WOD has thrusters, do light thrusters with empty bar or light weight for movement prep
- **Example**: If WOD has pull-ups, do light ring rows or banded pull-ups for activation
- **Example**: If WOD has running, do light mobility work and activation (not heavy lifting)

**MOVEMENT-SPECIFIC PROTOCOLS FOR CONDITIONING GOAL:**
- **Olympic Lifts (Cleans, Snatches)**: Light technique work only, movement prep, NOT heavy lifting, 2-3 sets of 3-5 reps, rest 30-60 sec
- **Powerlifting (Deadlifts, Squats, Presses)**: Light movement prep only, NOT heavy strength, 2-3 sets of 5-8 reps, rest 30-60 sec
- **Gymnastics (Pull-ups, Muscle-ups)**: Light activation, mobility work, NOT heavy skill work, 2-3 sets of 5-10 reps, rest 30-60 sec
- **Mobility/Activation**: Movement prep, activation, light skill work, 2-3 sets of 8-12 reps, rest 30-60 sec` : ''}

${goalType === 'balanced' ? `**BALANCED GOAL (Your Current Goal):**
- **Intensity**: Moderate (balance of strength and skill)
- **Sets/Reps**: 3-4 sets of 3-8 reps (moderate reps, balanced intensity)
- **Rest Periods**: 1-2 min between sets (moderate recovery)
- **Progression**: Mix of strength and skill work, practice WOD movements at lighter weight
- **Focus**: Balanced training, movement preparation, moderate intensity
- **Example**: If WOD has thrusters, do moderate weight thrusters (lighter than WOD weight) for movement prep
- **Example**: If WOD has pull-ups, do mix of strict and kipping pull-ups for balance
- **Example**: If WOD has Olympic lifts, do light to moderate weight work up to working weight

**MOVEMENT-SPECIFIC PROTOCOLS FOR BALANCED GOAL:**
- **Olympic Lifts (Cleans, Snatches)**: Work up to working weight (moderate intensity), practice complexes, 3-4 sets of 2-4 reps, rest 1-2 min
- **Powerlifting (Deadlifts, Squats, Presses)**: Moderate weight work (lighter than WOD weight), movement prep, 3-4 sets of 3-6 reps, rest 1-2 min
- **Gymnastics (Pull-ups, Muscle-ups)**: Mix of strict and kipping, skill work, 3-4 sets of 3-8 reps, rest 1-2 min
- **Accessory Work**: Balanced work, movement prep, 2-3 sets of 6-10 reps, rest 1 min` : ''}

**MOVEMENT-SPECIFIC PROTOCOLS (Apply Based on WOD Movements):**

- **Olympic Lifts (Cleans, Snatches, Jerks)**:
  - Work up to working weight (strength goal) or light technique work (conditioning goal)
  - Practice complexes (clean + jerk, snatch balance)
  - Technique work (hang positions, receiving positions)
  - Sets: 3-5 sets, Reps: 1-4 reps, Rest: 1-3 min (based on goal)

- **Powerlifting (Deadlifts, Squats, Presses, Thrusters)**:
  - Work up to 80-90% 1RM (strength goal) or light movement prep (conditioning goal)
  - Build to heavy single or double (strength goal)
  - Practice WOD movements at appropriate weight
  - Sets: 3-5 sets, Reps: 1-6 reps, Rest: 1-3 min (based on goal)

- **Gymnastics (Pull-ups, Muscle-ups, Handstands, Toes-to-Bar)**:
  - Practice strict versions (strength/skill goals)
  - Work on progressions (banded → kipping → strict)
  - Skill work (muscle-ups, handstands)
  - Sets: 3-5 sets, Reps: 3-10 reps, Rest: 1-2 min (based on goal)

- **Accessory Work (Supporting Movements)**:
  - Target weak points
  - Improve movement patterns
  - Support WOD movements
  - Sets: 2-4 sets, Reps: 5-12 reps, Rest: 1 min

**TRAINING TYPE INTEGRATION (Your Current Training Style: ${trainingType}):**

${trainingType === 'lifting' ? `**LIFTING FOCUS (Your Current Training Style):**
- **Primary Focus**: Barbell work, Olympic lifts, powerlifting movements
- **Skill/Strength Work Should Include**:
  - Barbell work (deadlifts, squats, presses, thrusters)
  - Olympic lifts (cleans, snatches, jerks)
  - Build to working weight or heavy singles
  - Practice complexes (clean + jerk, snatch balance)
  - Powerlifting movements (heavy singles, doubles, triples)
- **Examples**:
  - If WOD has thrusters: Build to heavy thruster single or practice thruster complexes
  - If WOD has cleans: Work up to working weight, practice clean complexes
  - If WOD has deadlifts: Build to heavy deadlift single or double
  - If WOD has squats: Build to heavy squat single or practice front/back squats
- **Equipment**: Use barbells, plates, and lifting equipment
- **Movement Selection**: Prioritize barbell movements over bodyweight/gymnastics` : ''}

${trainingType === 'gymnastics' ? `**GYMNASTICS FOCUS (Your Current Training Style):**
- **Primary Focus**: Bodyweight movements, skill work, gymnastics movements
- **Skill/Strength Work Should Include**:
  - Practice strict versions (strict pull-ups, strict muscle-ups, strict handstand push-ups)
  - Work on progressions (banded → kipping → strict)
  - Skill work (muscle-ups, handstands, toes-to-bar, ring work)
  - Core work (L-sits, hollow rocks, V-ups)
  - Gymnastics-specific movements
- **Examples**:
  - If WOD has pull-ups: Practice strict pull-ups, work on progressions
  - If WOD has muscle-ups: Practice muscle-up progressions, ring work
  - If WOD has handstand push-ups: Practice handstand holds, pike push-ups
  - If WOD has toes-to-bar: Practice strict toes-to-bar, hanging knee raises
- **Equipment**: Use pull-up bar, rings, parallettes, bands for progressions
- **Movement Selection**: Prioritize gymnastics/bodyweight movements over barbell work` : ''}

${trainingType === 'cardio' ? `**CARDIO FOCUS (Your Current Training Style):**
- **Primary Focus**: Cardio, conditioning, high-rep movements
- **Skill/Strength Work Should Include**:
  - Light skill work (NOT heavy strength - conserve energy for WOD)
  - Mobility and activation exercises
  - Movement prep (light weight, high reps)
  - Cardio-specific movements (running prep, rowing prep, bike prep)
  - Avoid heavy lifting (save energy for cardio WOD)
- **Examples**:
  - If WOD has running: Light mobility work, activation exercises, NOT heavy lifting
  - If WOD has rowing: Light rowing prep, activation exercises
  - If WOD has burpees: Light movement prep, mobility work
  - If WOD has thrusters: Light thruster movement prep (empty bar or light weight)
- **Equipment**: Use light equipment, mobility tools, cardio machines for prep
- **Movement Selection**: Prioritize light work, mobility, activation over heavy strength` : ''}

${trainingType === 'mixed' ? `**MIXED FOCUS (Your Current Training Style):**
- **Primary Focus**: Balanced mix of all movement domains
- **Skill/Strength Work Should Include**:
  - Mix of strength and skill work
  - Practice WOD movements at lighter weight
  - Balance different movement patterns (barbell, gymnastics, cardio prep)
  - Moderate intensity work
  - Movement preparation across all domains
- **Examples**:
  - If WOD has thrusters: Moderate weight thrusters (lighter than WOD weight) for movement prep
  - If WOD has pull-ups: Mix of strict and kipping pull-ups
  - If WOD has cleans: Work up to working weight (moderate intensity)
  - If WOD has running: Light mobility work, activation exercises
- **Equipment**: Use available equipment (barbells, bodyweight, cardio machines)
- **Movement Selection**: Balance different movement types based on WOD movements` : ''}

**EQUIPMENT ADAPTATION (Your Available Equipment: ${gearType}):**

${gearType === 'fullgym' ? `**FULL GYM (Your Available Equipment):**
- **Available Equipment**: Barbell, plates, pull-up bar, Concept2 rowing machine, Concept2 bike erg, Concept2 ski erg, assault bike, echo bike, box, rings, etc.
- **Skill/Strength Work Options**:
  - **Barbell Work**: Full range of barbell movements (deadlifts, squats, presses, cleans, snatches)
  - **Olympic Lifts**: Full Olympic lifting (cleans, snatches, jerks, complexes)
  - **Powerlifting**: Heavy singles, doubles, triples (deadlifts, squats, presses)
  - **Gymnastics**: Pull-ups, muscle-ups, handstands, ring work
  - **Accessory**: Full range of accessory movements
- **Examples**:
  - If WOD has thrusters: Use barbell to build to heavy thruster single
  - If WOD has cleans: Use barbell to work up to working weight
  - If WOD has pull-ups: Use pull-up bar for strict pull-ups
  - If WOD has muscle-ups: Use rings for muscle-up progressions
- **Movement Selection**: Use full range of equipment available` : ''}

${gearType === 'dumbbells' ? `**DUMBBELLS/KETTLEBELLS (Your Available Equipment):**
- **Available Equipment**: Dumbbells, kettlebells, plus bodyweight movements
- **Skill/Strength Work Options**:
  - **DB/KB Variations**: DB cleans, DB snatches, DB thrusters, DB presses, KB swings
  - **DB/KB Powerlifting**: DB deadlifts, DB squats, DB presses (heavier weight)
  - **DB/KB Olympic Lifts**: DB cleans, DB snatches (lighter than barbell)
  - **Bodyweight**: Pull-ups (if bar available), push-ups, bodyweight squats
  - **Accessory**: DB/KB accessory work
- **Examples**:
  - If WOD has thrusters: Use DB thrusters to build to heavy single or practice form
  - If WOD has cleans: Use DB cleans to work up to working weight
  - If WOD has deadlifts: Use DB deadlifts to build to heavy single
  - If WOD has pull-ups: Use bodyweight pull-ups or DB rows if no bar
- **Movement Selection**: Adapt barbell movements to DB/KB variations` : ''}

${gearType === 'bodyweight' ? `**BODYWEIGHT ONLY (Your Available Equipment):**
- **Available Equipment**: Bodyweight only, no equipment (or minimal equipment like bands, pull-up bar)
- **Skill/Strength Work Options**:
  - **Bodyweight Movements**: Push-ups, pull-ups (if bar available), squats, lunges
  - **Bodyweight Progressions**: Banded pull-ups, push-up progressions, squat progressions
  - **Core Work**: Planks, sit-ups, V-ups, hollow rocks
  - **Mobility Work**: Dynamic stretches, mobility exercises
  - **Skill Work**: Handstand progressions, muscle-up progressions (if bar/rings available)
- **Examples**:
  - If WOD has thrusters: Use bodyweight squats + overhead press (no weight) or air squats
  - If WOD has pull-ups: Use banded pull-ups or bodyweight rows if no bar
  - If WOD has deadlifts: Use bodyweight deadlifts (hip hinge movement) or single-leg deadlifts
  - If WOD has cleans: Use bodyweight movement prep (hip hinge, jump) or skip if not possible
- **Movement Selection**: Adapt all movements to bodyweight variations` : ''}

**HISTORY INTEGRATION & RECOVERY CONSIDERATION:**

${crossFitAnalysis && crossFitAnalysis.recentWorkouts.length > 0 ? `
**RECENT WORKOUT HISTORY ANALYSIS (Use this to inform skill/strength work):**

**Recovery Considerations:**
${crossFitAnalysis.intensityBalance.heavy >= 2 ? `- ⚠️ **Heavy strength work done ${crossFitAnalysis.intensityBalance.heavy}x this week** → Today's skill/strength work should be LIGHT (mobility, activation, movement prep) to allow recovery
- If recent workouts had heavy deadlifts/squats/presses → Use light movement prep, NOT heavy strength work
- If recent workouts had heavy Olympic lifts → Use light technique work, NOT heavy lifting` : ''}
${crossFitAnalysis.intensityBalance.skill >= 2 ? `- ✅ **Skill work done ${crossFitAnalysis.intensityBalance.skill}x this week** → Today can include strength work if goal is strength, or continue skill work if goal is skill` : ''}
${crossFitAnalysis.intensityBalance.light >= 2 ? `- ✅ **Light/conditioning work done ${crossFitAnalysis.intensityBalance.light}x this week** → Today can include heavier strength work if goal is strength` : ''}

**Movement Frequency Considerations:**
${Object.entries(crossFitAnalysis.movementFrequency)
  .sort((a: any, b: any) => b[1] - a[1])
  .slice(0, 5)
  .map(([movement, count]: [string, any]) => {
    if (count >= 2) {
      return `- ⚠️ **${movement}: ${count}x this week** → AVOID this movement in skill/strength work today (overtraining risk)`;
    }
    return '';
  })
  .filter((s: string) => s !== '')
  .join('\n')}

**Modality Balance Considerations:**
${crossFitAnalysis.modalityBalance.weightlifting >= 3 ? `- ⚠️ **Weightlifting done ${crossFitAnalysis.modalityBalance.weightlifting}x this week** → Today's skill/strength work should focus on gymnastics/mobility if goal allows, or use lighter weightlifting` : ''}
${crossFitAnalysis.modalityBalance.gymnastics >= 3 ? `- ⚠️ **Gymnastics done ${crossFitAnalysis.modalityBalance.gymnastics}x this week** → Today's skill/strength work should focus on weightlifting/mobility if goal allows, or use lighter gymnastics` : ''}

**Recent Workout Patterns:**
${crossFitAnalysis.recentWorkouts.slice(0, 3).map((w: any) => {
  const daysAgo = w.daysAgo || 0;
  const intensity = w.intensity || 'moderate';
  const movements = w.movements?.slice(0, 3).join(', ') || 'N/A';
  
  if (daysAgo <= 1 && intensity === 'heavy') {
    return `- **${w.workoutName}** (${daysAgo} day ago, ${intensity} intensity): ${movements} → Today's skill/strength should be LIGHT (recovery day)`;
  }
  if (daysAgo <= 1 && intensity === 'skill') {
    return `- **${w.workoutName}** (${daysAgo} day ago, ${intensity} intensity): ${movements} → Today can include strength work if goal is strength`;
  }
  return '';
}).filter((s: string) => s !== '').join('\n')}

**RECOVERY-BASED SKILL/STRENGTH GUIDELINES:**

${crossFitAnalysis.intensityBalance.heavy >= 2 || (crossFitAnalysis.recentWorkouts.length > 0 && crossFitAnalysis.recentWorkouts[0].intensity === 'heavy' && crossFitAnalysis.recentWorkouts[0].daysAgo <= 1) ? `
**IF RECENT WORKOUTS HAD HEAVY STRENGTH (Recovery Mode):**
- **Skill/Strength Work Should Be**: Light skill work, mobility, activation (NOT heavy strength)
- **Intensity**: Light (conserve energy, allow recovery)
- **Sets/Reps**: 2-3 sets of 5-10 reps (light work)
- **Rest Periods**: 30-60 sec between sets (minimal recovery needed)
- **Focus**: Movement prep, mobility, activation, NOT heavy lifting
- **Example**: If WOD has deadlifts, do light mobility work and activation, NOT heavy deadlift singles
- **Example**: If WOD has thrusters, do light thruster movement prep (empty bar), NOT heavy thruster singles` : ''}

${crossFitAnalysis.intensityBalance.skill >= 2 || (crossFitAnalysis.recentWorkouts.length > 0 && crossFitAnalysis.recentWorkouts[0].intensity === 'skill' && crossFitAnalysis.recentWorkouts[0].daysAgo <= 1) ? `
**IF RECENT WORKOUTS HAD SKILL WORK (Can Add Strength):**
- **Skill/Strength Work Can Include**: Strength work if goal is strength, or continue skill work if goal is skill
- **Intensity**: Based on goal type (strength = heavy, skill = technique, conditioning = light)
- **Focus**: Can include heavier work if goal is strength, or continue skill development` : ''}

${crossFitAnalysis.intensityBalance.light >= 2 || (crossFitAnalysis.recentWorkouts.length > 0 && crossFitAnalysis.recentWorkouts[0].intensity === 'light' && crossFitAnalysis.recentWorkouts[0].daysAgo <= 1) ? `
**IF RECENT WORKOUTS HAD LIGHT/CONDITIONING (Can Add Strength):**
- **Skill/Strength Work Can Include**: Heavier strength work if goal is strength
- **Intensity**: Based on goal type (strength = heavy, skill = technique, conditioning = light)
- **Focus**: Can include heavier work if goal is strength, body is recovered` : ''}

**MOVEMENT SELECTION BASED ON HISTORY:**
- **AVOID movements used 2+ times this week** in skill/strength work (overtraining risk)
- **PREFER movements NOT used recently** to balance programming
- **USE movements from WOD** that haven't been overused this week
- **BALANCE movement patterns** based on recent workout history` : ''}

**SKILL/STRENGTH REQUIREMENTS:**
- Provide a description explaining the skill/strength work and how it prepares for the WOD
- List movements in exercises array with sets, reps, weight, and rest periods
- **MUST practice or prepare for WOD movements** (not random exercises)
- **MUST match goal type** (strength = heavy, skill = technique, conditioning = light, balanced = moderate)
- **MUST match training type** (lifting focus = barbell work, gymnastics focus = skill work, cardio focus = light work, mixed = balanced work)
- **MUST match available equipment** (full gym = barbell work, dumbbells = DB/KB variations, bodyweight = bodyweight movements)
- **MUST consider recovery** (if recent workouts had heavy strength → use light work, if recent workouts had light work → can use heavier work)
- **MUST avoid overtraining** (avoid movements used 2+ times this week in skill/strength work)
- Movement count: ${timeChoice === 'quick' ? '3-5 movements (important for short WODs to fill time!)' : '2-4 movements'}
- Duration: ${timeChoice === 'quick' ? '20 minutes' : '15 minutes'}

**SKILL/STRENGTH EXAMPLES BASED ON WOD, GOAL, TRAINING TYPE, AND EQUIPMENT:**

${goalType === 'strength' ? `**STRENGTH GOAL EXAMPLES:**

- **WOD: Thrusters + Pull-ups, Goal: Strength** 
  ${trainingType === 'lifting' ? `→ Skill/Strength: Build to heavy thruster single (80-90% 1RM) with barbell, 5 sets of 3-5 strict pull-ups, rest 2-3 min` : ''}
  ${trainingType === 'gymnastics' ? `→ Skill/Strength: Practice strict pull-ups (5 sets of 3-5), bodyweight squats + overhead press for thruster prep, rest 2-3 min` : ''}
  ${trainingType === 'cardio' ? `→ Skill/Strength: Light thruster movement prep (empty bar), light pull-up activation, NOT heavy strength (conserve energy), rest 30-60 sec` : ''}
  ${trainingType === 'mixed' ? `→ Skill/Strength: Build to heavy thruster single (80-90% 1RM) with barbell, 5 sets of 3-5 strict pull-ups, rest 2-3 min` : ''}
  ${gearType === 'dumbbells' ? `(Equipment: Use DB thrusters instead of barbell)` : ''}
  ${gearType === 'bodyweight' ? `(Equipment: Use bodyweight squats + overhead press, banded pull-ups)` : ''}

- **WOD: Deadlifts + Running, Goal: Strength**
  ${trainingType === 'lifting' ? `→ Skill/Strength: Work up to heavy deadlift single (80-90% 1RM) with barbell, 3-5 sets of 1-3 reps, rest 2-3 min` : ''}
  ${trainingType === 'gymnastics' ? `→ Skill/Strength: Bodyweight deadlifts (hip hinge movement), single-leg deadlifts, NOT heavy barbell work, rest 1-2 min` : ''}
  ${trainingType === 'cardio' ? `→ Skill/Strength: Light mobility work, activation exercises, NOT heavy deadlifts (conserve energy for running), rest 30-60 sec` : ''}
  ${trainingType === 'mixed' ? `→ Skill/Strength: Work up to heavy deadlift single (80-90% 1RM) with barbell, 3-5 sets of 1-3 reps, rest 2-3 min` : ''}
  ${gearType === 'dumbbells' ? `(Equipment: Use DB deadlifts instead of barbell)` : ''}
  ${gearType === 'bodyweight' ? `(Equipment: Use bodyweight deadlifts, single-leg deadlifts)` : ''}

- **WOD: Cleans + Push-ups, Goal: Strength**
  ${trainingType === 'lifting' ? `→ Skill/Strength: Work up to heavy clean single (80-90% 1RM) with barbell, practice clean complexes, rest 2-3 min` : ''}
  ${trainingType === 'gymnastics' ? `→ Skill/Strength: Practice strict push-ups, bodyweight movement prep for cleans (hip hinge, jump), rest 1-2 min` : ''}
  ${trainingType === 'cardio' ? `→ Skill/Strength: Light clean movement prep (empty bar), light push-up activation, NOT heavy strength, rest 30-60 sec` : ''}
  ${trainingType === 'mixed' ? `→ Skill/Strength: Work up to heavy clean single (80-90% 1RM) with barbell, practice clean complexes, rest 2-3 min` : ''}
  ${gearType === 'dumbbells' ? `(Equipment: Use DB cleans instead of barbell)` : ''}
  ${gearType === 'bodyweight' ? `(Equipment: Use bodyweight movement prep, skip cleans if not possible)` : ''}` : ''}

${goalType === 'skill' ? `- **WOD: Muscle-ups + Handstands, Goal: Skill** → Skill/Strength: Practice muscle-up progressions (banded → kipping → strict), handstand holds and progressions, 3-5 sets of 3-8 reps, rest 1-2 min
- **WOD: Cleans + Snatches, Goal: Skill** → Skill/Strength: Practice clean/snatch technique work (hang positions, receiving positions), light complexes, 3-5 sets of 1-3 reps, rest 1-2 min
- **WOD: Pull-ups + Toes-to-Bar, Goal: Skill** → Skill/Strength: Practice strict pull-ups, toes-to-bar technique work, 3-5 sets of 3-8 reps, rest 1-2 min` : ''}

${goalType === 'conditioning' ? `- **WOD: Thrusters + Pull-ups, Goal: Conditioning** → Skill/Strength: Light thruster movement prep (empty bar or light weight), light ring rows or banded pull-ups for activation, 2-3 sets of 5-10 reps, rest 30-60 sec
- **WOD: Deadlifts + Running, Goal: Conditioning** → Skill/Strength: Light mobility work, activation exercises, NOT heavy deadlifts (conserve energy), 2-3 sets of 5-8 reps, rest 30-60 sec
- **WOD: Burpees + Box Jumps, Goal: Conditioning** → Skill/Strength: Light movement prep, mobility work, activation (NOT heavy strength), 2-3 sets of 5-10 reps, rest 30-60 sec` : ''}

${goalType === 'balanced' ? `- **WOD: Thrusters + Pull-ups, Goal: Balanced** → Skill/Strength: Moderate weight thrusters (lighter than WOD weight) for movement prep, mix of strict and kipping pull-ups, 3-4 sets of 3-8 reps, rest 1-2 min
- **WOD: Deadlifts + Running, Goal: Balanced** → Skill/Strength: Moderate weight deadlifts (movement prep), light activation work, 3-4 sets of 3-6 reps, rest 1-2 min
- **WOD: Cleans + Push-ups, Goal: Balanced** → Skill/Strength: Work up to working weight (moderate intensity), practice clean complexes, 3-4 sets of 2-4 reps, rest 1-2 min` : ''}

**Block 3: THE WOD (Main Workout - ${time.wodDuration} minutes)**
${timeChoice === 'quick' ? `- SHORT INTENSE WOD (10-15 min actual work time)
- Format: For Time (like Fran: 21-15-9) OR EMOM (${time.wodDuration} min) OR short AMRAP (10-12 min)
- Few movements, high intensity, quick finish
- Example: "For Time: 21-15-9 Thrusters (43kg) + Pull-ups"
- Example: "${time.wodDuration} min EMOM: Min 1: 10 Burpees, Min 2: 15 KB Swings, repeat"
- Example: "${time.wodDuration} min AMRAP: 10 Wall Balls, 8 KB Swings, 6 Box Jumps" (MUST include "${time.wodDuration} min")` : ''}
${timeChoice === 'classic' ? `- CLASSIC WOD (20-30 min)
- Format: EMOM (${time.wodDuration} min) OR For Time OR Rounds For Time (3-5 rounds) OR AMRAP (${time.wodDuration} min)
- Moderate complexity, sustained intensity
- Example: "${time.wodDuration} min EMOM: Min 1: 12 Deadlifts, Min 2: 9 Hand-release Push-ups, repeat" (MUST include "${time.wodDuration} min")
- Example: "For Time: 21-15-9 Thrusters and Pull-ups"
- Example: "5 Rounds For Time: 400m Run, 15 Thrusters, 15 Pull-ups"
- Example: "${time.wodDuration} min AMRAP: 12 Deadlifts, 9 Hand-release Push-ups, 6 Box Jumps" (MUST include "${time.wodDuration} min")` : ''}
${timeChoice === 'long' ? `- LONG GRINDER (40+ min)
- Format: EMOM (${time.wodDuration} min) OR Chipper OR high-volume Rounds OR AMRAP (${time.wodDuration} min)
- Many movements, test endurance and mental toughness
- Example: "${time.wodDuration} min EMOM: Min 1: 8 Deadlifts, Min 2: 12 Cal Row, repeat" (MUST include "${time.wodDuration} min")
- Example: "Chipper For Time: Complete all reps of each movement in order"
- Example: "${time.wodDuration} min AMRAP: 10+ movements" (MUST include "${time.wodDuration} min" for AMRAP)` : ''}

**CRITICAL FOR WOD BLOCK DESCRIPTION:**
- For AMRAP format: ALWAYS start with "${time.wodDuration} min AMRAP:" (include the time duration!)
- For EMOM format: ALWAYS start with "X min EMOM:" (include the time duration!)
- For Time format: Start with "For Time:" or "For Time (21-15-9):"
- For Rounds format: Start with "X Rounds For Time:"
- NEVER start AMRAP descriptions with just "AMRAP:" - always include the time duration first!

**Block 4: COOL-DOWN (10 minutes) - MUST BE BASED ON WOD MOVEMENTS**

**CRITICAL COOL-DOWN GENERATION PROCESS:**

1. **First, identify WOD movements**: List all primary movements in the WOD block you created (e.g., "Thrusters, Pull-ups, Running")
2. **Map to muscle groups**: Determine which muscles were worked (e.g., "Quads, shoulders, lats, calves, core")
3. **Select cool-down stretches**: Choose 2-3 stretches that target those specific muscles
4. **Generate cool-down**: Create a cool-down that directly addresses the muscles worked in the WOD

**COOL-DOWN REQUIREMENTS:**
- Provide a brief description of a simple cool-down flow focused on major areas taxed in the WOD
- List movements in column format - one movement with reps/duration per line (e.g., "2 min hamstring stretch", "1 min child's pose", "30 sec 90/90 hip switch each side")
- At most 2-3 simple movements in the exercises array, each with clear duration
- **MUST stretch the specific muscles worked in the WOD**
- **MUST mobilize the specific joints stressed in the WOD**
- Include simple breathing, light stretching, optional foam rolling suggestions
- CRITICAL: Do NOT include "for time" or "AMRAP" in cool-down - just list movements with duration

**COOL-DOWN EXAMPLES BASED ON WOD:**

- **WOD: Thrusters + Pull-ups** → Cool-down: Quad stretch (thrusters worked quads), shoulder stretch (thrusters worked shoulders), lat stretch (pull-ups worked lats), child's pose (full body recovery)
- **WOD: Deadlifts + Running** → Cool-down: Hamstring stretch (deadlifts worked hamstrings), quad stretch (running worked quads), hip flexor stretch (both movements), calf stretch (running worked calves)
- **WOD: Cleans + Push-ups** → Cool-down: Shoulder stretch (cleans and push-ups worked shoulders), hip flexor stretch (cleans worked hips), chest stretch (push-ups worked chest), lat stretch (cleans worked lats)
- **WOD: Burpees + Box Jumps** → Cool-down: Quad stretch (both movements worked quads), hip flexor stretch (both movements), shoulder stretch (burpees worked shoulders), calf stretch (box jumps worked calves)

**Movement Guidelines:**
- Warm-up block: 2-3 dynamic movements (plus a brief descriptive paragraph)
- Skill/Strength block: ${timeChoice === 'quick' ? '3-5 movements (important for short WODs to fill time!)' : '2-4 movements'}
- WOD block: ${time.wodDuration < 20 ? '2-4 movements (short and intense like Fran!)' : time.wodDuration < 35 ? '4-8 movements (classic CrossFit)' : '8-15 movements (long grinder!)'}
- Cool-down block: 2-3 stretches/mobility movements (plus a brief descriptive paragraph)
- Combine different movement patterns (push/pull, upper/lower)
- ${trainingType === 'mixed' ? 'Mix weightlifting, gymnastics, and cardio in the same workout' : `Focus primarily on ${trainingType} movements`}
- **ALWAYS use KILOGRAMS (kg) for all weights**
- Use metric units: kg for weights, meters for distances, cm for heights

**CRITICAL: Mono-Structural Movements (Cardio Machines) - Variety & Distance Required!**

**CROSSFIT PRINCIPLE: Constantly Varied - Use DIFFERENT mono-structural movements!**
- DO NOT always default to running - vary between machines for true CrossFit programming
- When including mono-structural work, PRIORITIZE variety:
  - If last workout had running → Use rowing, bike erg, ski erg, or assault bike this time
  - If full gym available: Use rowing, bike erg, ski erg, assault bike as often as running
  - Aim for variety: Running 30-40%, Rowing 25-30%, Bike Erg/Ski Erg/Assault Bike 25-30%
- CrossFit methodology emphasizes variation - don't bias toward any single mono-structural movement

**Mono-Structural Movement Options (ALWAYS include distance/calories):**
- **Running**: "400m Run", "800m Run", "1 mile Run", "2000m Run" (NEVER just "Run" or "1 round Run")
- **Rowing (Concept2 Rower)**: "500m Row", "1000m Row", "2000m Row" (NEVER just "Row")
- **Assault Bike/Echo Bike**: "20 Cal Assault Bike", "50 Cal Echo Bike" (NEVER just "Assault Bike")
- **Ski Erg**: "500m Ski Erg", "30 Cal Ski Erg" (NEVER just "Ski Erg")
- **Bike Erg (Concept2)**: "1000m Bike Erg", "25 Cal Bike Erg" (NEVER just "Bike Erg")
- **Other cardio machines**: ALWAYS specify distance (meters) or calories (Cal)

**Examples of CORRECT mono-structural movements (showing variety):**
✅ "400m Run" (NOT "Run" or "1 round Run")
✅ "1000m Row" (NOT "Row")
✅ "20 Cal Assault Bike" (NOT "Assault Bike")
✅ "500m Ski Erg" (NOT "Ski Erg")
✅ "800m Bike Erg" (variety - not just running!)
✅ "30 Cal Echo Bike" (variety - not just running!)

**Examples of INCORRECT (DO NOT USE):**
❌ "Run" (missing distance)
❌ "1 round Run" (missing distance)
❌ "Row" (missing distance)
❌ "Assault Bike" (missing distance/calories)

**VARIETY REQUIREMENT:**
- If workout includes mono-structural movements, USE VARIETY:
  - Mix: 400m Run, 1000m Row, 20 Cal Assault Bike (instead of always running)
  - Or alternate: Use rowing or bike erg as often as running
  - For full gym: Prefer machines (rowing, bike erg, ski erg, assault bike) as much as running

**CrossFit WOD Examples to Inspire You (DO NOT COPY - USE FOR INSPIRATION ONLY):**

${libraryExamples ? `${libraryExamples}

**CRITICAL:** These examples are for INSPIRATION only. DO NOT copy them exactly. Create NEW workouts with:
- Different rep schemes (don't use 5-10-15 pattern repeatedly)
- Different movement combinations
- Different workout names
- Varied formats and structures` : 'No library examples available. Use standard CrossFit formats.'}

**CRITICAL: Follow CrossFit WOD Structure**

Your generated workout MUST follow these CrossFit principles:

1. **Use WOD Formats** - Choose one based on library distribution (CRITICAL: Always include time duration for AMRAP/EMOM!):
   **Library Distribution:** EMOM (35.7%) > For Time (26.1%) > AMRAP (10.7%) > Rounds (9.6%) > Custom (7.9%) > Chipper (5.2%) > Tabata (4.8%)
   **IMPORTANT:** Match library distribution - prefer EMOM and For Time formats, use AMRAP less frequently (only ~11% of library).
   
   - EMOM: ALWAYS use "${time.wodDuration} min EMOM: Min 1: 10 Burpees, Min 2: 15 KB Swings, repeat" (include time duration!) - **MOST COMMON in library (35.7%)**
   - For Time: "For Time: 21-15-9 Thrusters and Pull-ups" - **SECOND MOST COMMON in library (26.1%)**
   - AMRAP: ALWAYS use "${time.wodDuration} min AMRAP: 10 Wall Balls, 8 KB Swings, 6 Box Jumps" (include time duration!) - **Use less frequently (~11% of library)**
   - Rounds: "5 Rounds For Time: 400m Run, 15 Thrusters, 15 Pull-ups" (OR "5 Rounds For Time: 1000m Row, 15 Thrusters, 15 Pull-ups" for variety!)
   - Chipper: "For Time: 50-40-30-20-10 of 5 different movements"
   - Tabata: "Tabata (20s on/10s off) x 8 rounds: Push-ups, Sit-ups, Squat Jumps, KB Swings"
   
   **IMPORTANT:** For AMRAP and EMOM formats, you MUST include the time duration (e.g., "${time.wodDuration} min") before the format name!

2. **Movement Variety** - Include 6-12 different movements mixing:
   - Gymnastics: Pull-ups, push-ups, handstand push-ups, toes-to-bar, muscle-ups
   - Weightlifting: Thrusters, cleans, snatches, deadlifts, presses, front squats
   - MetCon: Burpees, box jumps, wall balls, double-unders, KB swings
   - **Mono-Structural (VARY THESE!):** 
     * Running: 400m, 800m, 1600m, 2000m
     * Rowing: 500m, 1000m, 2000m (USE OFTEN - don't just default to running!)
     * Bike Erg: 1000m, 25 Cal, 50 Cal (USE OFTEN)
     * Ski Erg: 500m, 30 Cal (USE OFTEN)
     * Assault Bike/Echo Bike: 20 Cal, 50 Cal (USE OFTEN)
   - **CRITICAL:** When including mono-structural movements, vary between machines! Use rowing, bike erg, ski erg, and assault bike as often as running to maintain CrossFit's "constantly varied" principle.

3. **Rep Schemes** - Use CrossFit-style reps:
   - 21-15-9 (Fran style)
   - 50-40-30-20-10 (Chipper descending)
   - 10-8-6-4-2 (Strength ladder)
   - Max reps in time window (AMRAP)
   - Fixed reps every minute (EMOM)

4. **Actual Examples from the Library Above**:
   - Study the WOD examples provided
   - Create workouts with similar complexity
   - Use the same movement combinations
   - Follow the same format structures

**Output Format (MUST be valid JSON with 4 BLOCKS):**
{
  "name": "WOD name (e.g., 'Fran-Style Burner', 'EMOM Power', 'Hero WOD: The Grinder')",
  "description": "MUST START WITH WOD FORMAT, e.g.: '${time.wodDuration} min EMOM:' or 'For Time (21-15-9):' or '5 Rounds For Time:' or '${time.wodDuration} min AMRAP:' followed by brief description",
  "duration": 60,
  "focus": "${trainingType}",
  "blocks": [
    {
      "blockType": "warm-up",
      "blockName": "Warm-Up",
      "duration": 10,
      "description": "Warm-up description that mobilizes and activates muscles/joints used in WOD (e.g., '5 Rounds For Time: Air squats, arm circles, lat activation to prepare for thrusters and pull-ups')",
      "exercises": [
        {
          "name": "Movement name (MUST be related to WOD movements)",
          "reps": "10 reps" or "200m" or "2 min",
          "instructions": "Brief cue",
          "order": 1
        }
      ]
    },
    {
      "blockType": "skill",
      "blockName": "Skill/Strength Work",
      "duration": ${timeChoice === 'quick' ? 20 : 15},
      "description": "Description explaining skill/strength work and how it prepares for WOD movements (e.g., 'Build to heavy thruster single at 80-90% 1RM to prepare for thrusters in WOD' or 'Practice muscle-up progressions to prepare for muscle-ups in WOD')",
      "exercises": [
        {
          "name": "Movement from WOD or related movement",
          "reps": "Sets x reps (e.g., '5 sets x 3-5 reps' or 'Build to heavy single')",
          "weight": "Progressive or specific weight (e.g., 'Work up to 80-90% 1RM' or 'Empty bar to working weight')",
          "restTime": "Rest period in seconds (e.g., 120-180 for strength, 60-120 for skill, 30-60 for conditioning)",
          "instructions": "Detailed instructions including sets, reps, weight, rest, and how it prepares for WOD (e.g., '5 sets of 3-5 strict pull-ups, rest 2-3 min between sets. Build strength for pull-ups in WOD.')",
          "order": 1
        }
      ]
    },
    {
      "blockType": "wod",
      "blockName": "The WOD",
      "duration": ${time.wodDuration},
      "wodFormat": "AMRAP/EMOM/For Time/Chipper/Rounds",
      "description": "CRITICAL: MUST START WITH TIME DURATION + FORMAT! Examples:
        - For AMRAP: ALWAYS include time, e.g., '${time.wodDuration} min AMRAP:' (NOT just 'AMRAP:')
        - For EMOM: ALWAYS include time, e.g., '${time.wodDuration} min EMOM:' or '12 min EMOM:'
        - For Time: Can be 'For Time:' or 'For Time (21-15-9):'
        - For Rounds: Include number, e.g., '5 Rounds For Time:'
        - For Chipper: Can be 'Chipper For Time:' or 'For Time:'
        
        Complete examples:
        - '${time.wodDuration} min AMRAP: Complete rounds of 10 wall balls, 8 KB swings, 6 box jumps. Repeat as many rounds as possible'
        - 'For Time: Do 21 thrusters then 21 pull-ups, then 15 thrusters then 15 pull-ups, then 9 thrusters then 9 pull-ups'
        - '5 Rounds For Time: Each round do 1000m row, then 15 thrusters, then 15 pull-ups. Complete 5 rounds total' (Variety - use rowing/bike erg as often as running!)
        - '5 Rounds For Time: Each round do 400m run, then 15 thrusters, then 15 pull-ups. Complete 5 rounds total' (Variety - mix running with other machines)
        - '12 min EMOM: Minute 1 do 10 burpees, Minute 2 do 15 wall balls, Minute 3 rest, repeat'",
      "exercises": [
        {
          "name": "Movement name (CrossFit terminology). CRITICAL: For mono-structural movements (running, rowing, bike erg, ski erg, assault bike), ALWAYS include distance/calories in the name, e.g., '400m Run', '1000m Row', '20 Cal Assault Bike' - NEVER just 'Run' or 'Row'",
          "description": "Brief explanation",
          "type": "strength/cardio/flexibility/balance",
          "reps": "21-15-9" or "10 reps" or "max reps",
          "weight": "43/29 kg" or "bodyweight",
          "instructions": "Form cues and scaling",
          "muscleGroups": ["full body"],
          "order": 1
        }
      ]
    },
    {
      "blockType": "cooldown",
      "blockName": "Cool-Down & Stretching",
      "duration": 10,
      "description": "Cool-down description that stretches and mobilizes muscles/joints worked in WOD (e.g., 'Focus on stretching quads, shoulders, and lats after thrusters and pull-ups')",
      "exercises": [
        {
          "name": "Stretch or mobility movement (MUST target muscles worked in WOD)",
          "reps": "30-60 seconds" or "2 min",
          "instructions": "Stretch specific muscles used in WOD (e.g., 'Quad stretch to release tension from thrusters')",
          "order": 1
        }
      ]
    }
  ]
}

**EXAMPLES OF GOOD DESCRIPTIONS:**

**WOD Block (Match library distribution - EMOM and For Time most common):**
- "${time.wodDuration} min EMOM: Min 1: 10 Burpees, Min 2: 15 KB Swings, Min 3: 20 Sit-ups, repeat" (MUST include "${time.wodDuration} min") - **MOST COMMON format**
- "For Time (21-15-9): Heavy thrusters paired with pull-ups - a Fran-style burner" - **SECOND MOST COMMON format**
- "5 Rounds For Time: 1000m Row + bodyweight movements - pure conditioning" (Variety! Use rowing/bike erg as often as running)
- "${time.wodDuration} min AMRAP: Complete rounds of 10 wall balls, 8 KB swings, 6 box jumps" (MUST include "${time.wodDuration} min") - **Use less frequently (~11% of library)**
- "12 min EMOM: Alternating strength and cardio for balanced training" (MUST include "12 min")
- "For Time: 50-40-30-20-10 Wall Balls, KB Swings, Box Jumps"

**Warm-Up Block (MUST reference WOD movements):**
- "5 Rounds For Time: Air squats, arm circles, lat activation to prepare for thrusters and pull-ups"
- "3 Rounds: Leg swings, easy run, hip circles to warm up for deadlifts and running"
- "3 Rounds: PVC pass-throughs, hip circles, push-up prep to prepare for cleans and push-ups"

**Cool-Down Block (MUST reference WOD muscles):**
- "Focus on stretching quads, shoulders, and lats after thrusters and pull-ups"
- "Stretch hamstrings, quads, and calves after deadlifts and running"
- "Mobilize shoulders, hips, and chest after cleans and push-ups"

**CRITICAL REMINDERS:**
- Description MUST START with the format, and for AMRAP/EMOM, MUST include the time duration
- For AMRAP: ALWAYS use "${time.wodDuration} min AMRAP:" (or the actual WOD duration in minutes)
- For EMOM: ALWAYS use "X min EMOM:" where X is the duration
- Description MUST include the WOD format (AMRAP/EMOM/For Time/Rounds)
- **MONO-STRUCTURAL MOVEMENTS: ALWAYS include distance/calories in the movement name AND USE VARIETY!**
  - Running: "400m Run", "800m Run", "1 mile Run" (NEVER just "Run" or "1 round Run")
  - Rowing: "500m Row", "1000m Row", "2000m Row" (NEVER just "Row") - **USE ROWING OFTEN!**
  - Assault Bike/Echo Bike: "20 Cal Assault Bike", "50 Cal Echo Bike" (NEVER just "Assault Bike") - **USE OFTEN!**
  - Ski Erg: "500m Ski Erg", "30 Cal Ski Erg" (NEVER just "Ski Erg") - **USE OFTEN!**
  - Bike Erg: "1000m Bike Erg", "25 Cal Bike Erg" (NEVER just "Bike Erg") - **USE OFTEN!**
- **CRITICAL VARIETY REQUIREMENT:** When including mono-structural movements, DO NOT default to running every time! CrossFit principle: Constantly Varied. Use rowing, bike erg, ski erg, and assault bike as often as running (especially for full gym workouts). Aim for 30-40% running, 25-30% rowing, 25-30% bike erg/ski erg/assault bike.
- Use the EXACT movement names from the example WODs above
- Follow the rep schemes from the examples (21-15-9, 50-40-30-20-10, etc.)
- Include 8-12 movements minimum for a real CrossFit workout
- All weights in KILOGRAMS (kg)
- Scaling options and form cues are REQUIRED in the WOD block ONLY. Do NOT include scaling options or form cues in Warm-up or Cool-down blocks.

**MOVEMENT SEQUENCE CLARITY (VERY IMPORTANT!):**
The WOD block description MUST explain the exact sequence of movements!

❌ BAD (unclear):
"For Time: 21-15-9 Thrusters and Deadlifts"

✅ GOOD (crystal clear):
"For Time: Complete 21 thrusters, then 21 deadlifts, then 15 thrusters, then 15 deadlifts, then 9 thrusters, then 9 deadlifts"

Other clear examples:
- "20 min AMRAP: Each round consists of 10 wall balls, then 8 KB swings, then 6 box jumps. Repeat this sequence for 20 minutes"
- "5 Rounds For Time: Each round you will run 400m, then do 15 thrusters, then 15 pull-ups. Complete all 5 rounds"
- "EMOM 12 min: Minute 1 do 10 burpees, Minute 2 do 15 wall balls, Minute 3 rest, then repeat this pattern"
- "Chipper For Time: Do all 50 box jumps first, then all 40 wall balls, then all 30 burpees, etc. Work through the list in order"

**CRITICAL: VARIETY REQUIREMENT - DO NOT REPEAT WORKOUTS:**
- **DO NOT copy exact workouts from the library examples** - Use them for INSPIRATION only
- **DO NOT use the same rep scheme repeatedly** (e.g., don't always use 5-10-15 pattern)
- **CRITICAL: AVOID the 5-10-15 rep pattern** (5 Pull-ups, 10 Push-ups, 15 Squats) - this is overused, use different rep schemes instead (e.g., 10-8-6, 12-9-6, 21-15-9, etc.)
- **DO NOT generate the same workout name** (e.g., don't generate "Cindy" or any benchmark name multiple times - create NEW descriptive names instead)
- **DO create NEW workouts** with varied rep schemes, movements, and formats
- **DO vary rep schemes** - Use different patterns: 10-8-6, 12-9-6, 21-15-9, 50-40-30-20-10, etc.
- **DO vary movements** - Don't always use the same movements (pull-ups, push-ups, squats)
- **DO use different workout names** - Create descriptive names, not just benchmark names

**TASK: Study the WOD examples provided above and create a NEW workout that:**
1. Uses the SAME format structure as one of the examples - **MATCH LIBRARY DISTRIBUTION: Prefer EMOM (35.7%) and For Time (26.1%), use AMRAP less frequently (10.7%)**
2. Uses SIMILAR movements to the examples (thrusters, pull-ups, burpees, KB swings, box jumps, wall balls, etc.) BUT with DIFFERENT rep schemes
3. Has SIMILAR complexity to the examples (multiple movements, varied rep schemes)
4. Follows CrossFit WOD conventions exactly like the examples do
5. **IS DIFFERENT from the library examples** - Don't copy them exactly, create variations
6. **CRITICAL:** When selecting format, match library distribution - EMOM and For Time should be selected more often than AMRAP

**CRITICAL SESSION STRUCTURE:**
✅ ALL sessions must be EXACTLY 60 minutes total
✅ MUST include ALL 4 blocks: Warm-up (10min) + Skill/Strength (15-20min) + WOD (${time.wodDuration}min) + Cool-down (10min)
✅ The WOD block contains the main CrossFit workout (AMRAP/EMOM/For Time/etc.)
✅ For SHORT WODs: Spend more time on skill/strength work (like practicing pull-ups before Fran)
✅ For LONG WODs: The WOD itself is the main time consumer

**CRITICAL: WARM-UP, SKILL/STRENGTH, AND COOL-DOWN MUST BE BASED ON WOD MOVEMENTS:**
✅ **WARM-UP**: MUST analyze WOD movements first, then generate warm-up that mobilizes/activates those specific muscles/joints
✅ **SKILL/STRENGTH**: MUST analyze WOD movements first, then generate skill/strength work that prepares for those specific movements based on:
  - **Goal type** (strength = heavy, skill = technique, conditioning = light, balanced = moderate)
  - **Training type** (lifting = barbell work, gymnastics = skill work, cardio = light work, mixed = balanced work)
  - **Available equipment** (full gym = barbell work, dumbbells = DB/KB variations, bodyweight = bodyweight movements)
  - **Recovery status** (if recent workouts had heavy strength → use light work, if recent workouts had light work → can use heavier work)
  - **Movement frequency** (avoid movements used 2+ times this week in skill/strength work to prevent overtraining)
✅ **COOL-DOWN**: MUST analyze WOD movements first, then generate cool-down that stretches/mobilizes those specific muscles/joints
✅ **DO NOT** generate generic warm-ups/skill work/cool-downs - they MUST be specific to the WOD movements
✅ **DO** reference the WOD movements in all block descriptions (e.g., "prepare for thrusters and pull-ups" or "stretch quads and shoulders after thrusters")
✅ **DO** match skill/strength work to goal type, training type, available equipment, and recovery status
✅ **DO** avoid overtraining by not using movements that have been used 2+ times this week in skill/strength work

**EXAMPLE for "Quick" choice:**
- **WOD Analysis**: Thrusters + Pull-ups
- **Muscles/Joints**: Quads, glutes, shoulders, lats, hips, knees, ankles
- **Warm-up (10 min)**: Air squats (hip/knee mobility for thrusters), arm circles (shoulder mobility for thrusters), lat activation/band pull-aparts (lat activation for pull-ups)
- **Skill/Strength (20 min)**: 
  ${goalType === 'strength' ? 'Build to heavy thruster single (80-90% 1RM, e.g., work up to 70-80kg), 5 sets of 3-5 strict pull-ups (rest 2-3 min between sets). Prepare for heavy thrusters and pull-ups in WOD.' : ''}
  ${goalType === 'skill' ? 'Practice thruster technique work (empty bar to light weight), practice pull-up progressions (banded → kipping → strict), 3-5 sets of 3-8 reps (rest 1-2 min between sets). Focus on technique for thrusters and pull-ups in WOD.' : ''}
  ${goalType === 'conditioning' ? 'Light thruster movement prep (empty bar), light ring rows or banded pull-ups for activation, 2-3 sets of 5-10 reps (rest 30-60 sec between sets). Movement prep only, conserve energy for WOD.' : ''}
  ${goalType === 'balanced' ? 'Moderate weight thrusters (lighter than WOD weight, e.g., 30kg), mix of strict and kipping pull-ups, 3-4 sets of 3-8 reps (rest 1-2 min between sets). Balanced preparation for thrusters and pull-ups in WOD.' : ''}
- **WOD (20 min)**: "For Time: 21-15-9 Thrusters (43kg) + Pull-ups" (actual work ~10 min)
- **Cool-down (10 min)**: Quad stretch (thrusters worked quads), shoulder stretch (thrusters worked shoulders), lat stretch (pull-ups worked lats)

**DO NOT generate simple workouts like "3 sets of 10 squats" - that is NOT CrossFit!**
**DO generate complex WODs like "For Time: 21-15-9 Thrusters + Pull-ups" - that IS CrossFit!**

**SCALING OPTIONS IN WOD ONLY:**
Every movement in the WOD block MUST include scaling options:
- RX (prescribed/advanced)
- Scaled (intermediate)
- Beginner (novice/accessible)

Do NOT include scaling options or form cues in Warm-up or Cool-down blocks.

Example:
Movement: Thrusters
Instructions: "RX: 43/29 kg barbell. Scaled: 20/12 kg dumbbells. Beginner: PVC pipe or air squats + press. Keep core tight, full depth squat."

Movement: Pull-ups
Instructions: "RX: Strict pull-ups. Scaled: Kipping pull-ups or jumping pull-ups. Beginner: Ring rows or banded pull-ups. Full extension at bottom, chin over bar at top."

Generate a complete 60-minute CrossFit training session with all 4 blocks that perfectly matches the user's preferences!`;
  }

  private parseWorkoutResponse(content: string): GeneratedSingleWorkout {
    try {
      console.log('=== AI Response (first 500 chars) ===');
      console.log(content.substring(0, 500));

      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const parsed = JSON.parse(cleanContent);

      if (!parsed.name || !parsed.blocks || !Array.isArray(parsed.blocks)) {
        throw new Error('Invalid workout structure - missing blocks');
      }

      // Validate we have all required blocks
      const blockTypes = parsed.blocks.map((b: any) => b.blockType);
      const requiredBlocks = ['warm-up', 'wod', 'cooldown'];
      const hasRequired = requiredBlocks.every(type => blockTypes.includes(type));
      
      if (!hasRequired) {
        console.warn('Missing required blocks, but proceeding...');
      }

      return {
        name: parsed.name,
        description: parsed.description || '',
        duration: 60, // Always 60 minutes
        focus: parsed.focus || 'mixed',
        blocks: parsed.blocks,
      };
    } catch (error) {
      console.error('Error parsing workout:', error);
      console.error('Raw content:', content);
      throw new Error('Failed to parse workout');
    }
  }
}

