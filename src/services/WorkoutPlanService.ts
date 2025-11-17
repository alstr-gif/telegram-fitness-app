import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { WorkoutPlan, PlanStatus } from '../entities/WorkoutPlan';
import { Workout, WorkoutStatus } from '../entities/Workout';
import { Exercise } from '../entities/Exercise';
import { User } from '../entities/User';
import { AIWorkoutService, GeneratedWorkoutPlan } from './AIWorkoutService';

export class WorkoutPlanService {
  private planRepository: Repository<WorkoutPlan>;
  private workoutRepository: Repository<Workout>;
  private exerciseRepository: Repository<Exercise>;
  private aiService: AIWorkoutService;

  constructor() {
    this.planRepository = AppDataSource.getRepository(WorkoutPlan);
    this.workoutRepository = AppDataSource.getRepository(Workout);
    this.exerciseRepository = AppDataSource.getRepository(Exercise);
    this.aiService = new AIWorkoutService();
  }

  async generateAIPlan(user: User, weeksCount: number = 2): Promise<WorkoutPlan> {
    // Validate user profile
    if (
      !user.fitnessLevel ||
      !user.primaryGoal ||
      !user.preferredWorkoutDays ||
      user.preferredWorkoutDays.length === 0 ||
      !user.preferredDuration
    ) {
      throw new Error('User profile is incomplete. Please complete your fitness profile first.');
    }

    // Generate workout plan using AI
    const generatedPlan: GeneratedWorkoutPlan = await this.aiService.generateWorkoutPlan({
      fitnessLevel: user.fitnessLevel,
      primaryGoal: user.primaryGoal,
      preferredDays: user.preferredWorkoutDays,
      duration: user.preferredDuration,
      availableEquipment: user.availableEquipment,
      injuries: user.injuries,
      weeksCount,
    });

    // Create workout plan entity
    const plan = this.planRepository.create({
      name: generatedPlan.name,
      description: generatedPlan.description,
      userId: user.id,
      status: PlanStatus.ACTIVE,
      startDate: new Date(),
      totalWorkouts: generatedPlan.workouts.length,
      completedWorkouts: 0,
      metadata: {
        generatedBy: 'ai',
        model: 'gpt-4',
        preferences: {
          fitnessLevel: user.fitnessLevel,
          primaryGoal: user.primaryGoal,
          duration: user.preferredDuration,
        },
      },
    });

    const savedPlan = await this.planRepository.save(plan);

    // Create workouts with exercises
    await this.createWorkoutsFromGenerated(savedPlan, generatedPlan);

    // Return the complete plan with relations
    return await this.findById(savedPlan.id);
  }

  private async createWorkoutsFromGenerated(
    plan: WorkoutPlan,
    generatedPlan: GeneratedWorkoutPlan
  ): Promise<void> {
    const startDate = new Date(plan.startDate);
    
    for (const [index, generatedWorkout] of generatedPlan.workouts.entries()) {
      // Calculate the scheduled date
      const weekNumber = Math.floor(index / plan.metadata?.preferences?.duration || 3);
      const scheduledDate = this.calculateWorkoutDate(
        startDate,
        generatedWorkout.dayOfWeek,
        weekNumber
      );

      const workout = this.workoutRepository.create({
        planId: plan.id,
        name: generatedWorkout.name,
        description: generatedWorkout.description,
        dayOfWeek: generatedWorkout.dayOfWeek.toLowerCase(),
        scheduledDate,
        duration: generatedWorkout.duration,
        focus: generatedWorkout.focus,
        status: WorkoutStatus.SCHEDULED,
      });

      const savedWorkout = await this.workoutRepository.save(workout);

      // Create exercises
      for (const generatedExercise of generatedWorkout.exercises) {
        const exercise = this.exerciseRepository.create({
          workoutId: savedWorkout.id,
          name: generatedExercise.name,
          description: generatedExercise.description,
          type: generatedExercise.type as any,
          sets: generatedExercise.sets,
          reps: generatedExercise.reps,
          duration: generatedExercise.duration,
          weight: generatedExercise.weight,
          restTime: generatedExercise.restTime,
          instructions: generatedExercise.instructions,
          muscleGroups: generatedExercise.muscleGroups,
          order: generatedExercise.order,
        });

        await this.exerciseRepository.save(exercise);
      }
    }
  }

  private calculateWorkoutDate(
    startDate: Date,
    dayOfWeek: string,
    weekOffset: number
  ): Date {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = dayNames.indexOf(dayOfWeek.toLowerCase());
    
    if (targetDayIndex === -1) {
      throw new Error(`Invalid day of week: ${dayOfWeek}`);
    }

    const date = new Date(startDate);
    const currentDay = date.getDay();
    const daysUntilTarget = (targetDayIndex - currentDay + 7) % 7;
    
    date.setDate(date.getDate() + daysUntilTarget + (weekOffset * 7));
    return date;
  }

  async findById(id: string): Promise<WorkoutPlan> {
    const plan = await this.planRepository.findOne({
      where: { id },
      relations: ['user', 'workouts', 'workouts.exercises'],
    });

    if (!plan) {
      throw new Error('Workout plan not found');
    }

    return plan;
  }

  async getUserPlans(userId: string): Promise<WorkoutPlan[]> {
    return await this.planRepository.find({
      where: { userId },
      relations: ['workouts', 'workouts.exercises'],
      order: { createdAt: 'DESC' },
    });
  }

  async getActivePlan(userId: string): Promise<WorkoutPlan | null> {
    return await this.planRepository.findOne({
      where: { userId, status: PlanStatus.ACTIVE },
      relations: ['workouts', 'workouts.exercises'],
      order: { createdAt: 'DESC' },
    });
  }

  async updatePlanStatus(planId: string, status: PlanStatus): Promise<WorkoutPlan> {
    const plan = await this.findById(planId);
    plan.status = status;
    
    if (status === PlanStatus.COMPLETED || status === PlanStatus.CANCELLED) {
      plan.endDate = new Date();
    }
    
    return await this.planRepository.save(plan);
  }

  async markWorkoutComplete(workoutId: string): Promise<Workout> {
    const workout = await this.workoutRepository.findOne({
      where: { id: workoutId },
      relations: ['plan'],
    });

    if (!workout) {
      throw new Error('Workout not found');
    }

    workout.status = WorkoutStatus.COMPLETED;
    workout.completedAt = new Date();

    // Update plan's completed workouts count
    const plan = workout.plan;
    plan.completedWorkouts += 1;
    
    await this.planRepository.save(plan);
    return await this.workoutRepository.save(workout);
  }

  async getUpcomingWorkouts(userId: string, limit: number = 7): Promise<Workout[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.workoutRepository
      .createQueryBuilder('workout')
      .leftJoinAndSelect('workout.plan', 'plan')
      .leftJoinAndSelect('workout.exercises', 'exercises')
      .where('plan.userId = :userId', { userId })
      .andWhere('plan.status = :status', { status: PlanStatus.ACTIVE })
      .andWhere('workout.scheduledDate >= :today', { today })
      .andWhere('workout.status != :completedStatus', { completedStatus: WorkoutStatus.COMPLETED })
      .orderBy('workout.scheduledDate', 'ASC')
      .limit(limit)
      .getMany();
  }

  async deletePlan(planId: string): Promise<void> {
    await this.planRepository.delete(planId);
  }
}

