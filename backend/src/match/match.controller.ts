import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match } from './match.entity';


@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) { }

  @Post('create/:tournamentId')
  async createMatches(
    @Param('tournamentId') tournamentId: number,
    @Body('numTeams') numTeams: number,
  ) {
    return this.matchService.createMatchesFromSchema(tournamentId, numTeams);
  }

  @Post('assign-teams/:tournamentId')
  async assignTeams(@Param('tournamentId') tournamentId: number, @Body() teams: any) {
    return this.matchService.assignTeamsToMatches(tournamentId, teams);
  }

  @Post('result/:matchId')
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
  async assignTeamsToMatch(
    @Param('tournamentId') tournamentId: number,
    @Param('matchId') matchId: number,
    @Body() teams: { team1Id: number, team2Id: number }
  ) {
    return this.matchService.assignTeamsToSpecificMatch(tournamentId, matchId, teams.team1Id, teams.team2Id);
  }

  @Delete('remove-teams/:tournamentId/:matchId')
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

}