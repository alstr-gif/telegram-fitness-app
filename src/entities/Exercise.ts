import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workout } from './Workout';

export enum ExerciseType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
}

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workout, (workout) => workout.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workoutId' })
  workout: Workout;

  @Column()
  workoutId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    enum: ExerciseType,
    default: ExerciseType.STRENGTH,
  })
  type: ExerciseType;

  @Column({ type: 'int', nullable: true })
  sets?: number;

  @Column({ type: 'int', nullable: true })
  reps?: number;

  @Column({ type: 'int', nullable: true })
  duration?: number; // in seconds

  @Column({ type: 'float', nullable: true })
  weight?: number; // in kg

  @Column({ type: 'int', nullable: true })
  restTime?: number; // in seconds

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ type: 'simple-array', nullable: true })
  muscleGroups?: string[];

  @Column({ type: 'int' })
  order: number; // Exercise order in the workout

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'simple-json', nullable: true })
  performanceData?: {
    actualSets?: number;
    actualReps?: number;
    actualWeight?: number;
    actualDuration?: number;
    notes?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

