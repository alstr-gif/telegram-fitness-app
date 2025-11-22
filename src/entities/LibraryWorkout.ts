import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * LibraryWorkout Entity
 * 
 * Stores curated CrossFit workouts in the database for:
 * - Direct selection based on user preferences
 * - AI inspiration with better filtering
 * - Easy management and updates
 * - Scalability to 100+ workouts
 */
export type WorkoutType = 'AMRAP' | 'EMOM' | 'For Time' | 'Chipper' | 'Rounds' | 'Tabata' | 'Custom';
export type IntensityLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentNeeded = 'bodyweight' | 'dumbbells' | 'barbell' | 'fullgym' | 'minimal';

@Entity('library_workouts')
export class LibraryWorkout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'varchar',
  })
  type: WorkoutType;

  @Column({ type: 'int', nullable: true })
  duration?: number; // Optional: estimated duration in minutes

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array' })
  movements: string[]; // Array of movement strings with reps

  @Column({ type: 'text', nullable: true })
  notes?: string; // Scaling options, modifications, target times

  // Metadata for filtering and smart selection
  @Column({
    type: 'varchar',
    nullable: true,
  })
  intensity?: IntensityLevel;

  @Column({ type: 'varchar', nullable: true })
  equipmentNeeded?: EquipmentNeeded;

  @Column({ type: 'simple-array', nullable: true })
  requiredEquipment?: string[]; // Detailed: ['barbell', 'pullup_bar', 'box']

  @Column({ type: 'simple-array', nullable: true })
  muscleGroups?: string[]; // ['upper_body', 'lower_body', 'core', 'full_body']

  @Column({ type: 'simple-array', nullable: true })
  movementDomains?: string[]; // ['gymnastics', 'weightlifting', 'cardio', 'mixed']

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[]; // ['benchmark', 'hero_wod', 'named_wod', 'short', 'long', 'grinder']

  @Column({ type: 'boolean', default: false })
  isBenchmark: boolean; // Famous WODs like Fran, Murph, etc.

  @Column({ type: 'boolean', default: false })
  isHeroWOD: boolean; // Hero workouts honoring fallen soldiers

  @Column({ type: 'int', default: 0 })
  popularityScore: number; // Usage counter or manual rating

  @Column({ type: 'text', nullable: true })
  rxWeight?: string; // Prescribed weight, e.g., "43/29 kg"

  @Column({ type: 'text', nullable: true })
  targetTime?: string; // Target completion time for advanced athletes

  // JSON field for storing full workout structure
  // This allows us to store the complete workout data in a structured format
  @Column({ type: 'simple-json', nullable: true })
  workoutStructure?: {
    blocks?: Array<{
      blockType: 'warm-up' | 'skill' | 'wod' | 'cooldown';
      blockName: string;
      duration: number;
      exercises: Array<{
        name: string;
        reps?: string | number;
        weight?: string;
        instructions?: string;
      }>;
    }>;
    wodFormat?: string;
    wodDescription?: string;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Allow disabling workouts without deleting

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}











