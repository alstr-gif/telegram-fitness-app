import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { WorkoutPlan } from './WorkoutPlan';
import { Exercise } from './Exercise';

export enum WorkoutStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkoutPlan, (plan) => plan.workouts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planId' })
  plan: WorkoutPlan;

  @Column()
  planId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  dayOfWeek: string; // e.g., 'monday', 'tuesday'

  @Column({ type: 'date' })
  scheduledDate: Date;

  @Column({ type: 'int' })
  duration: number; // in minutes

  @Column()
  focus: string; // e.g., 'Upper Body', 'Cardio', 'Full Body'

  @OneToMany(() => Exercise, (exercise) => exercise.workout, { cascade: true })
  exercises: Exercise[];

  @Column({
    type: 'varchar',
    enum: WorkoutStatus,
    default: WorkoutStatus.SCHEDULED,
  })
  status: WorkoutStatus;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'int', nullable: true })
  caloriesBurned?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

