import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards, NotFoundException, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express'


@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)                                                                              
  @Get('profile')                                                                                       
  async getUserProfile(@Req() req: Request): Promise<User> {                                                     
    const userId = req.user.userId;                                                                     
    const user = await this.userService.findById(userId);                                               
    if (!user) {                                                                                        
      throw new NotFoundException('User not found');                                                    
    }                                                                                                   
    return user;                                                                                        
  } 

  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUser(@Param('id') id: number, @Body() userData: Partial<User>): Promise<User> {
    return this.userService.update(id, userData);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.userService.delete(id);
  }
}