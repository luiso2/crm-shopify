import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Session } from './session.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    const access_token = this.jwtService.sign(payload);
    
    // Create session
    const session = await this.createSession(user.id, access_token);
    
    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      expiresIn: 3600,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create user
    const userData: Partial<User> = {
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.name, // Using name as firstName for now
      role: registerDto.role === 'customer' ? UserRole.USER : (registerDto.role as UserRole || UserRole.USER),
      isActive: true,
    };

    const user = await this.usersService.create(userData);
    
    // Auto login after registration
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    const access_token = this.jwtService.sign(payload);
    
    // Create session
    await this.createSession(user.id, access_token);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      expiresIn: 3600,
    };
  }

  async logout(userId: string, token: string) {
    // Remove session
    await this.sessionRepository.delete({ userId, token });
    return { message: 'Logged out successfully' };
  }

  async createSession(userId: string, token: string): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    const session = this.sessionRepository.create({
      userId,
      token,
      expiresAt,
      lastActivity: new Date(),
    });

    return this.sessionRepository.save(session);
  }

  async validateSession(token: string): Promise<Session | null> {
    const session = await this.sessionRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    await this.sessionRepository.save(session);

    return session;
  }

  async refreshToken(oldToken: string) {
    const session = await this.validateSession(oldToken);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const payload = { 
      email: session.user.email, 
      sub: session.user.id, 
      role: session.user.role,
      firstName: session.user.firstName,
      lastName: session.user.lastName
    };
    
    const access_token = this.jwtService.sign(payload);
    
    // Update session with new token
    session.token = access_token;
    session.expiresAt = new Date();
    session.expiresAt.setHours(session.expiresAt.getHours() + 24);
    await this.sessionRepository.save(session);

    return {
      access_token,
      expiresIn: 3600,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashedPassword });

    // Invalidate all sessions for this user
    await this.sessionRepository.delete({ userId });

    return { message: 'Password changed successfully. Please login again.' };
  }
}
