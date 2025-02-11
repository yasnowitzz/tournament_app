import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';  // ✅ Import this
import { UserModule } from '../user/user.module'; // Adjust the path as necessary

@Module({
  imports: [
    ConfigModule.forRoot(), // Załaduj zmienne z .env
    PassportModule.register({ defaultStrategy: 'jwt' }),  // ✅ Ensure Passport is registered
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Pobierz klucz z .env
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') }, // Czas ważności tokena
      }),
      inject: [ConfigService],
    }),
    UserModule, // Importujemy UserModule, aby używać UserService
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],  // ✅ Ensure `JwtStrategy` is listed in providers
  exports: [AuthService, JwtStrategy], 
})
export class AuthModule {}
