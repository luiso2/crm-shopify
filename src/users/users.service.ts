import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'role', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'role', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'firstName', 'lastName', 'avatar', 'role', 'isActive', 'lastLogin', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.usersRepository.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new ConflictException(`User with email ${userData.email} already exists`);
    }

    // Generate unique ID if not provided
    if (!userData.id) {
      userData.id = this.generateUniqueId();
    }

    const newUser = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(newUser);
    
    // Remove password from response
    delete savedUser.password;
    return savedUser;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    // Don't allow email update if it already exists for another user
    if (userData.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email: userData.email } });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`Email ${userData.email} is already in use`);
      }
    }

    await this.usersRepository.update(id, userData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLogin: new Date() });
  }

  private generateUniqueId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
