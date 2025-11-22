import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WorkoutPlan } from './WorkoutPlan';

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum FitnessGoal {
  LOSE_WEIGHT = 'lose_weight',
  BUILD_MUSCLE = 'build_muscle',
  INCREASE_ENDURANCE = 'increase_endurance',
  GENERAL_FITNESS = 'general_fitness',
  STRENGTH_TRAINING = 'strength_training',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  telegramId: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  photoUrl?: string;

  // Fitness Profile
  @Column({
    type: 'varchar',
    enum: FitnessLevel,
    default: FitnessLevel.BEGINNER,
  })
  fitnessLevel: FitnessLevel;

  @Column({
    type: 'varchar',
    enum: FitnessGoal,
    default: FitnessGoal.GENERAL_FITNESS,
  })
  primaryGoal: FitnessGoal;

  @Column({ type: 'simple-array', nullable: true })
  preferredWorkoutDays?: string[]; // e.g., ['monday', 'wednesday', 'friday']

  @Column({ type: 'int', nullable: true })
  preferredDuration?: number; // in minutes

  @Column({ type: 'simple-array', nullable: true })
  availableEquipment?: string[];

  @Column({ type: 'text', nullable: true })
  injuries?: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ type: 'float', nullable: true })
  weight?: number; // in kg

  @Column({ type: 'float', nullable: true })
  height?: number; // in cm

  // Relationships
  @OneToMany(() => WorkoutPlan, (plan) => plan.user)
  workoutPlans: WorkoutPlan[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

