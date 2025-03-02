import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user ?? undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepo.findOne({ where: { email } });
    return user ?? undefined;
  }

  async create(user: Partial<User>): Promise<User> {
    try {
      const newUser = this.userRepo.create(user);
      return await this.userRepo.save(newUser);
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'UQ_e12875dfb3b1d92d7d7c5377e22') {                                                
        throw new ConflictException('Email już istnieje');
      }
      throw error;                                           
    }
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.userRepo.update(id, userData);
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
  }

  async delete(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }

  async getUserRoleByToken(token: string): Promise<string | null> {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      if (!decoded || !decoded.email) return null;
      console.log('Decoded token:', decoded);

      const user = await this.findByEmail(decoded.email);
      return user?.role || null;
    } catch (error) {
      console.error('Error decoding token or fetching user role:', error);
      return null;
    }
  }

  async findOrCreateUser(firstName: string, lastName: string, email: string): Promise<User> {
    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      user = new User();
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.password = undefined;  // ✅ No password (account cannot log in)
      user = await this.userRepo.save(user);
    }

    return user;
  }
}