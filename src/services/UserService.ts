import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User, FitnessLevel, FitnessGoal } from '../entities/User';

export interface CreateUserDTO {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export interface UpdateUserProfileDTO {
  fitnessLevel?: FitnessLevel;
  primaryGoal?: FitnessGoal;
  preferredWorkoutDays?: string[];
  preferredDuration?: number;
  availableEquipment?: string[];
  injuries?: string;
  age?: number;
  weight?: number;
  height?: number;
}

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findByTelegramId(telegramId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { telegramId },
      relations: ['workoutPlans'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['workoutPlans'],
    });
  }

  async createUser(data: CreateUserDTO): Promise<User> {
    const existingUser = await this.findByTelegramId(data.telegramId);
    
    if (existingUser) {
      // Update existing user data if needed
      Object.assign(existingUser, data);
      return await this.userRepository.save(existingUser);
    }

    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  async updateProfile(
    telegramId: string,
    profileData: UpdateUserProfileDTO
  ): Promise<User> {
    const user = await this.findByTelegramId(telegramId);
    
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, profileData);
    return await this.userRepository.save(user);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({
      where: { isActive: true },
    });
  }

  async deactivateUser(telegramId: string): Promise<void> {
    const user = await this.findByTelegramId(telegramId);
    
    if (user) {
      user.isActive = false;
      await this.userRepository.save(user);
    }
  }

  async isProfileComplete(telegramId: string): Promise<boolean> {
    const user = await this.findByTelegramId(telegramId);
    
    if (!user) {
      return false;
    }

    return !!(
      user.fitnessLevel &&
      user.primaryGoal &&
      user.preferredWorkoutDays &&
      user.preferredWorkoutDays.length > 0 &&
      user.preferredDuration
    );
  }
}

