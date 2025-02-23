import { Controller, Post, Param, Body, Req, UseGuards, UnauthorizedException, Get } from '@nestjs/common';
import { TeamService } from './team.service';
import { Request } from 'express';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

@Controller('teams')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly userService: UserService // ✅ Inject UserService
  ) { }

  @Post('register/:tournamentId')
  @UseGuards(JwtAuthGuard) // ✅ Requires authentication
  async registerTeam(
    @Param('tournamentId') tournamentId: number,
    @Body() partnerDetails: { firstName: string; lastName: string; email: string },
    @Req() request: Request
  ) {
    const user = request.user as JwtPayload;  // ✅ Explicitly cast `request.user` to `JwtPayload`
    console.log('User:', user);
    if (!user || !user.userId) {
      throw new UnauthorizedException('Invalid authentication data');
    }

    // ✅ Find the logged-in user by ID
    const player1 = await this.userService.findById(user.userId);
    if (!player1) {
      throw new UnauthorizedException('User not found');
    }

    return this.teamService.registerTeamForTournament(tournamentId, player1, partnerDetails);
  }

  @Get('tournament/:tournamentId')
  async getTeamsByTournament(@Param('tournamentId') tournamentId: number) {
    return this.teamService.getTeamsByTournament(tournamentId);
  }
}