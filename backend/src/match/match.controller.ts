import { Controller, Post, Body, Param, Get, Delete, UseGuards, Patch } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match } from './match.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateMatchDetailsDto } from './dto/update-match-details.dto';


@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) { }

  @Post('create/:tournamentId')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createMatches(
    @Param('tournamentId') tournamentId: number,
    @Body('numTeams') numTeams: number,
  ) {
    return this.matchService.createMatchesFromSchema(tournamentId, numTeams);
  }

  @Post('assign-teams/:tournamentId')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async assignTeams(@Param('tournamentId') tournamentId: number, @Body() teams: any) {
    return this.matchService.assignTeamsToMatches(tournamentId, teams);
  }

  @Post('result/:matchId')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateMatchResult(
    @Param('matchId') matchId: number,
    @Body() body: { setResults: { team1_score: number, team2_score: number }[] }
  ) {
    return this.matchService.updateMatchResult(matchId, body.setResults);
  }

  @Get('tournament/:tournamentId')
  async getMatches(@Param('tournamentId') tournamentId: number): Promise<Match[]> {
    return this.matchService.getMatchesByTournament(tournamentId);
  }

  @Post('assign-teams/:tournamentId/:matchId')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async assignTeamsToMatch(
    @Param('tournamentId') tournamentId: number,
    @Param('matchId') matchId: number,
    @Body() teams: { team1Id: number, team2Id: number }
  ) {
    return this.matchService.assignTeamsToSpecificMatch(tournamentId, matchId, teams.team1Id, teams.team2Id);
  }

  @Delete('remove-teams/:tournamentId/:matchId')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async removeTeamsFromMatch(
    @Param('tournamentId') tournamentId: number,
    @Param('matchId') matchId: number
  ) {
    return this.matchService.removeTeamsFromSpecificMatch(tournamentId, matchId);
  }
  @Get(':matchId/result')                                                                                           
  async getMatchResult(@Param('matchId') matchId: number) {                                                         
    return this.matchService.getMatchResult(matchId);                                                               
  }  

  @Patch('update-details/:matchId')                                                                             
  @Roles('admin')                                                                                               
  @UseGuards(JwtAuthGuard, RolesGuard)                                                                          
  async updateMatchDetails(                                                                                     
    @Param('matchId') matchId: number,                                                                          
    @Body() updateMatchDetailsDto: UpdateMatchDetailsDto,                                                       
  ): Promise<Match> {                                                                                           
    return this.matchService.updateMatchDetails(matchId, updateMatchDetailsDto);                                
  }
}