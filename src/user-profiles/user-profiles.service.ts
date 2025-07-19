import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserProfilesService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  async create(createUserProfileDto: CreateUserProfileDto): Promise<UserProfile> {
    // Verificar si ya existe un perfil para este usuario
    const existingProfile = await this.userProfileRepository.findOne({
      where: { userId: createUserProfileDto.userId },
    });

    if (existingProfile) {
      throw new ConflictException('User profile already exists');
    }

    const profile = this.userProfileRepository.create(createUserProfileDto);
    return await this.userProfileRepository.save(profile);
  }

  async findAll(): Promise<UserProfile[]> {
    return await this.userProfileRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`User profile with ID ${id} not found`);
    }

    return profile;
  }

  async findByUserId(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`User profile for user ${userId} not found`);
    }

    return profile;
  }

  async update(id: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    const profile = await this.findOne(id);

    Object.assign(profile, updateUserProfileDto);

    return await this.userProfileRepository.save(profile);
  }

  async updateByUserId(userId: string, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);

    Object.assign(profile, updateUserProfileDto);

    return await this.userProfileRepository.save(profile);
  }

  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);
    await this.userProfileRepository.remove(profile);
  }

  async removeByUserId(userId: string): Promise<void> {
    const profile = await this.findByUserId(userId);
    await this.userProfileRepository.remove(profile);
  }

  async updatePreferences(id: string, preferences: Record<string, any>): Promise<UserProfile> {
    const profile = await this.findOne(id);

    profile.preferences = {
      ...profile.preferences,
      ...preferences,
    };

    return await this.userProfileRepository.save(profile);
  }

  async updateTheme(userId: string, theme: 'light' | 'dark' | 'auto'): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);
    profile.theme = theme;
    return await this.userProfileRepository.save(profile);
  }

  async updateLanguage(userId: string, language: string): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);
    profile.language = language;
    return await this.userProfileRepository.save(profile);
  }

  async updateTimezone(userId: string, timezone: string): Promise<UserProfile> {
    const profile = await this.findByUserId(userId);
    profile.timezone = timezone;
    return await this.userProfileRepository.save(profile);
  }

  async createOrUpdate(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    let profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.userProfileRepository.create({
        userId,
        ...data,
      });
    } else {
      Object.assign(profile, data);
    }

    return await this.userProfileRepository.save(profile);
  }
}
