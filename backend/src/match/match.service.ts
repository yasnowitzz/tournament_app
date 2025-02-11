import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { Tournament } from '../tournament/tournament.entity';
import { Team } from '../team/team.entity';
import { SetService } from '../set/set.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private readonly setService: SetService, // Correct injection
  ) { }

  private loadMatchSchema(): any {
    let filePath = path.join(process.cwd(), 'src', 'data', 'matches-schema.json');

    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), 'dist', 'data', 'matches-schema.json'); // Check dist folder in production
    }

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(`Match schema file not found: ${filePath}`);
    }

    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  }

  private createMatch(
    tournament: Tournament,
    matchData: { match_id: number; next_match_win?: number; next_match_lose?: number, stage: string }
  ): Match {
    const match = new Match();
    match.match_id = matchData.match_id;
    match.tournament = tournament;
    match.next_match_win = matchData.next_match_win ?? 0;
    match.next_match_lose = matchData.next_match_lose ?? 0;
    match.stage = matchData.stage;
    return match;
  }

  async getMatch(id: number) {
    return this.matchRepository.findOne({ where: { id } });
  }

  async createMatchesFromSchema(tournamentId: number, numTeams: number) {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }

    const schema = this.loadMatchSchema();
    console.log(schema);
    const matches = schema[numTeams].rounds.map((matchData: {
      match_id: number;
      next_match_win?: number;
      next_match_lose?: number;
      stage: string;
    }) => this.createMatch(tournament, matchData));

    await this.matchRepository.save(matches);
    return matches;
  }

  async assignTeamsToMatches(tournamentId: number, teams: { [key: number]: { team1: number, team2: number } }) {
    const matches = await this.matchRepository.find({
      where: { tournament: { id: tournamentId } },
    });

    matches.forEach(async (match) => {
      if (teams[match.id]) {
        const team1 = await this.teamRepository.findOne({ where: { id: teams[match.id].team1 } });
        if (!team1) {
          throw new BadRequestException(`Team with id ${teams[match.id].team1} not found`);
        }
        match.team1 = team1;
        const team2 = await this.teamRepository.findOne({ where: { id: teams[match.id].team2 } });
        if (!team2) {
          throw new BadRequestException(`Team with id ${teams[match.id].team2} not found`);
        }
        match.team2 = team2;
      }
    });

    await this.matchRepository.save(matches);
  }

  async assignTeamsToSpecificMatch(tournamentId: number, matchId: number, team1Id: number, team2Id: number) {
    // Pobranie meczu
    const match = await this.matchRepository.findOne({
        where: { id: matchId, tournament: { id: tournamentId } },
        relations: ['tournament'],
    });

    if (!match) {
        throw new BadRequestException('Match not found');
    }

    // Sprawdzenie, czy drużyny są różne
    if (team1Id === team2Id) {
        throw new BadRequestException("The same team cannot play against itself.");
    }

    // Pobranie drużyn
    const team1 = await this.teamRepository.findOne({ where: { id: team1Id } });
    if (!team1) {
        throw new BadRequestException(`Team with id ${team1Id} not found`);
    }

    const team2 = await this.teamRepository.findOne({ where: { id: team2Id } });
    if (!team2) {
        throw new BadRequestException(`Team with id ${team2Id} not found`);
    }

    // Pobranie meczów w tej samej rundzie turnieju
    const sameStageMatches = await this.matchRepository.find({
        where: { tournament: { id: tournamentId }, stage: match.stage },
        relations: ['team1', 'team2'],
    });

    // Sprawdzenie, czy drużyna już jest przypisana do innego meczu w tej samej rundzie
    for (const existingMatch of sameStageMatches) {
        if (existingMatch.id !== matchId) { // Pomijamy obecny mecz
            if (existingMatch.team1?.id === team1Id || existingMatch.team2?.id === team1Id) {
                throw new BadRequestException(`Team ${team1Id} is already assigned in this round.`);
            }
            if (existingMatch.team1?.id === team2Id || existingMatch.team2?.id === team2Id) {
                throw new BadRequestException(`Team ${team2Id} is already assigned in this round.`);
            }
        }
    }

    // Przypisanie drużyn do meczu
    match.team1 = team1;
    match.team2 = team2;

    await this.matchRepository.save(match);
    return match;
}

  async removeTeamsFromSpecificMatch(tournamentId: number, matchId: number) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId, tournament: { id: tournamentId } },
    });

    if (!match) {
      throw new BadRequestException('Match not found');
    }

    match.team1 = null;
    match.team2 = null;

    await this.matchRepository.save(match);
    return match;
  }

  async updateMatchResult(matchId: number, setResults: { team1_score: number, team2_score: number }[]) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['team1', 'team2', 'sets']
    });

    if (!match) {
      throw new BadRequestException('Match not found');
    }

    // Zapisujemy wyniki setów poprzez SetService
    const sets = await this.setService.saveMatchSets(match, setResults);

    // Obliczamy liczbę wygranych setów dla każdej drużyny
    let team1SetsWon = 0;
    let team2SetsWon = 0;

    sets.forEach((set) => {
      if (set.team1_score > set.team2_score) {
        team1SetsWon++;
      } else if (set.team2_score > set.team1_score) {
        team2SetsWon++;
      }
    });

    // Określamy zwycięzcę
    let winningTeamId: number | null = null;
    if (team1SetsWon > team2SetsWon) {
      if (!match.team1) {
        throw new BadRequestException('Team1 is not assigned to the match');
      }
      winningTeamId = match.team1.id;
    } else if (team2SetsWon > team1SetsWon) {
      if (!match.team2) {
        throw new BadRequestException('Team2 is not assigned to the match');
      }
      winningTeamId = match.team2.id;
    }

    if (!winningTeamId) {
      throw new BadRequestException('Match is a draw, cannot proceed'); // W razie remisu (nie powinno się zdarzyć)
    }

    match.winner = winningTeamId;
    await this.matchRepository.save(match);

    // Automatyczne przypisanie drużyn do kolejnych meczów
    if (match.next_match_win) {
      const nextMatchWin = await this.matchRepository.findOne({ where: { id: match.next_match_win } });
      if (nextMatchWin) {
        nextMatchWin.team1 = nextMatchWin.team1 ?? await this.teamRepository.findOneOrFail({ where: { id: winningTeamId } });
        await this.matchRepository.save(nextMatchWin);
      }
    }

    if (match.next_match_lose) {
      if (!match.team1 || !match.team2) {
        throw new BadRequestException('One of the teams is not assigned to the match');
      }
      const losingTeamId = match.team1.id === winningTeamId ? match.team2.id : match.team1.id;
      if (losingTeamId) {
        const nextMatchLose = await this.matchRepository.findOne({ where: { id: match.next_match_lose } });
        if (nextMatchLose) {
          nextMatchLose.team1 = nextMatchLose.team1 ?? await this.teamRepository.findOneOrFail({ where: { id: losingTeamId } });
          await this.matchRepository.save(nextMatchLose);
        }
      }
    }

    return {
      message: `Match ${matchId} updated successfully`,
      winner: winningTeamId,
      team1SetsWon,
      team2SetsWon,
      sets
    };
  }

  async getMatchesByTournament(tournamentId: number) {
    return this.matchRepository
      .createQueryBuilder('match')
      .innerJoinAndSelect('match.tournament', 'tournament')
      .leftJoinAndSelect('match.team1', 'team1')
      .leftJoinAndSelect('match.team2', 'team2')
      .leftJoinAndSelect('team1.player1', 'team1Player1')
      .leftJoinAndSelect('team1.player2', 'team1Player2')
      .leftJoinAndSelect('team2.player1', 'team2Player1')
      .leftJoinAndSelect('team2.player2', 'team2Player2')
      .leftJoinAndSelect('match.sets', 'sets')
      .select([
        'match.id',
        'match.match_id',
        'match.next_match_win',
        'match.next_match_lose',
        'match.stage',
        'match.winner',
        'team1.id',
        'team2.id',
        'team1Player1.firstName',
        'team1Player1.lastName',
        'team1Player2.firstName',
        'team1Player2.lastName',
        'team2Player1.firstName',
        'team2Player1.lastName',
        'team2Player2.firstName',
        'team2Player2.lastName',
        'sets',
      ])
      .where('tournament.id = :tournamentId', { tournamentId })
      .getMany();
  }
}
