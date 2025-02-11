import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {  // ✅ Ensure 'jwt' is explicitly named
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Pobieramy token z nagłówka Authorization
      ignoreExpiration: false, // Token nie może być przeterminowany
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret', // Pobieramy JWT_SECRET z .env lub używamy wartości domyślnej
    });
    console.log('✅ JwtStrategy initialized');  // ✅ Debugging log
  }

  async validate(payload: any) {
    console.log('JWT payload received:', payload); // Debugging log
    return { userId: payload.sub, email: payload.email, role: payload.role }; // Zwrot danych użytkownika
  }
}
