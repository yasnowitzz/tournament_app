import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any): any {
    console.log('User: ' + user); // Debugging log
    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing token');
    }
    console.log('Authenticated User:', user); // Debugging log
    return user;
  }
}  
