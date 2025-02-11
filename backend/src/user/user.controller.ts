import { Controller, Get, Param, Post, Body, Patch, Delete, UseGuards, NotFoundException, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get(':id')
  // async findById(@Param('id') id: number): Promise<User> {
  //   const user = await this.userService.findById(id);
  //   if (!user) {
  //     throw new NotFoundException(`User with id ${id} not found`);
  //   }
  //   return user;
  // }

  @Get('role')
  async getUserRole(@Headers('Authorization') authHeader: string): Promise<{ role: string | null }> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new NotFoundException('Invalid or missing token');
    }

    const token = authHeader.split(' ')[1];
    const role = await this.userService.getUserRoleByToken(token);

    if (!role) {
      throw new NotFoundException('User role not found');
    }

    return { role };
  }

  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
  }

  @Patch(':id')
  @Roles('admin')
  async updateUser(@Param('id') id: number, @Body() userData: Partial<User>): Promise<User> {
    return this.userService.update(id, userData);
  }

  @Delete(':id')
  @Roles('admin')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.userService.delete(id);
  }
}