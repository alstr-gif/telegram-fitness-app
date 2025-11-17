import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('workout_results')
export class WorkoutResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  workoutName: string;

  @Column({ nullable: true })
  workoutType: string; // AMRAP, EMOM, For Time, Chipper, Rounds, etc.

  // Result data based on workout type
  @Column({ type: 'int', nullable: true })
  timeSeconds?: number; // For "For Time" workouts

  @Column({ type: 'int', nullable: true })
  rounds?: number; // For AMRAP

  @Column({ type: 'int', nullable: true })
  reps?: number; // Additional reps in AMRAP

  @Column({ type: 'float', nullable: true })
  weight?: number; // For strength work (in kg)

  @Column({ type: 'simple-json', nullable: true })
  additionalData?: {
    movements?: string[];
    repScheme?: string;
    rxOrScaled?: 'RX' | 'Scaled' | 'Beginner';
    notes?: string;
  };

  // Feedback
  @Column({ type: 'boolean', nullable: true })
  liked?: boolean; // true = like, false = dislike, null = no feedback

  @Column({ type: 'text', nullable: true })
  userNotes?: string;

  @Column({ type: 'simple-json', nullable: true })
  fullWorkoutData?: any; // Store complete workout for reference

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


