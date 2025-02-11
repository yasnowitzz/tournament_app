import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // Pobieramy zmienne z .env
  ) { }

  // async login(loginDto: { email: string; password: string }) {
  //   const user = await this.userService.findByEmail(loginDto.email);
  //   if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  //   console.log('User authenticated successfully:', user.email);
  
  //   const payload = { email: user.email, sub: user.id, role: user.role };
  //   return {
  //     access_token: this.jwtService.sign(payload, {
  //       secret: this.configService.get<string>('JWT_SECRET'),
  //       expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
  //     }),
  //   };
  // }

  async login(loginDto: { email: string; password: string }) {
    const user = await this.userService.findByEmail(loginDto.email);

    // Check if user exists AND has a password
    console.log('User:', user);
    console.log('User password:', user ? user.password : 'No user');
    console.log('Login DTO password:', loginDto.password);

    if (!user || !user.password || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('User authenticated successfully:', user.email);

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
      }),
    };
  }

  async register(user: { email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(user.password, 10); // Hashowanie hasła
    return this.userService.create({ ...user, password: hashedPassword });
  }
}
