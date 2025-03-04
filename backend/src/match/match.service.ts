import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './match.entity';
import { Tournament } from '../tournament/tournament.entity';
import { Team } from '../team/team.entity';
import { SetService } from '../set/set.service';
import { Set } from '../set/set.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateMatchDetailsDto } from './dto/update-match-details.dto';
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
    @InjectRepository(Set)
    private setRepository: Repository<Set>,
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
    matchData: { match_id: number; next_match_win?: number; next_match_lose?: number, stage: string },
    court: number,
    scheduledTime: Date,
  ): Match {
    const match = new Match();
    match.match_id = matchData.match_id;
    match.tournament = tournament;
    match.next_match_win = matchData.next_match_win ?? 0;
    match.next_match_lose = matchData.next_match_lose ?? 0;
    match.stage = matchData.stage;
    match.court = court;
    match.scheduledTime = scheduledTime;
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
    const matchesData = schema[numTeams].rounds;

    const numCourts = tournament.numCourts;
    const matchDuration = parseInt(tournament.matchDuration.toString(), 10); // Załóżmy, że matchDuration jest minutach                                                                                                        
    const breakDuration = parseInt(tournament.breakDuration.toString(), 10);
    const startTime = new Date(tournament.startTime); // Załóżmy, że startTime jest przechowywany jako Date     

    // Inicjalizacja harmonogramu dla każdego boiska                                                            
    const courtSchedules: Date[] = Array(numCourts).fill(startTime);

    const matches: Match[] = [];

    matchesData.forEach((matchData: any) => {
      // Znajdowanie boiska z najwcześniejszym dostępnym czasem                                                 
      let earliestCourtIndex = 0;
      let earliestTime = courtSchedules[0];

      for (let i = 1; i < courtSchedules.length; i++) {
        if (courtSchedules[i] < earliestTime) {
          earliestTime = courtSchedules[i];
          earliestCourtIndex = i;
        }
      }

      // Przypisanie boiska i czasu                                                                             
      const scheduledTime = new Date(courtSchedules[earliestCourtIndex]);
      const court = earliestCourtIndex + 1; // Boiska numerowane od 1                                           

      // Aktualizacja harmonogramu boiska                                                                       
      courtSchedules[earliestCourtIndex] = new Date(scheduledTime.getTime() + (matchDuration + breakDuration) *
        60000);

      // Tworzenie meczu                                                                                        
      const match = this.createMatch(tournament, matchData, court, scheduledTime);
      matches.push(match);
    });

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

    // Usuwamy istniejące sety
    const deleteResult = await this.setRepository.delete({ match: { id: matchId } });
    console.log(`Deleted sets:`, deleteResult);

    // Usunięcie referencji do setów w obiekcie match, aby nie zawierał już usuniętych setów
    match.sets = [];

    // Zapisujemy nowe wyniki
    const sets = await this.setService.saveMatchSets(match, setResults);

    let team1SetsWon = 0;
    let team2SetsWon = 0;

    sets.forEach((set) => {
      if (set.team1_score > set.team2_score) {
        team1SetsWon++;
      } else if (set.team2_score > set.team1_score) {
        team2SetsWon++;
      }
    });

    let winningTeamId: number | null = null;
    if (team1SetsWon > team2SetsWon) {
      if (!match.team1) throw new BadRequestException('Team1 is not assigned to the match');
      winningTeamId = match.team1.id;
    } else if (team2SetsWon > team1SetsWon) {
      if (!match.team2) throw new BadRequestException('Team2 is not assigned to the match');
      winningTeamId = match.team2.id;
    }

    if (!winningTeamId) {
      throw new BadRequestException('Match is a draw, cannot proceed');
    }

    match.winner = winningTeamId;
    await this.matchRepository.save(match);

    // Automatyczna aktualizacja kolejnego meczu
    await this.updateNextMatch(match.id, winningTeamId);

    return { message: 'Score updated successfully' };
  }

  async updateNextMatch(matchId: number, winningTeamId: number) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['team1', 'team2', 'tournament'],
    });

    if (!match) {
      throw new BadRequestException('Match not found');
    }
    console.log(`Match to be updated`, match);
    const losingTeamId = match.team1?.id === winningTeamId ? match.team2?.id : match.team1?.id;

    console.log(`Winning team: ${winningTeamId}, Losing team: ${losingTeamId}`);
    // 🛑 Usuwamy stare przypisania z następnych meczów, jeśli zmienił się zwycięzca
    await this.clearNextMatchAssignment(match.next_match_win, losingTeamId, match.tournament.id);
    await this.clearNextMatchAssignment(match.next_match_lose, winningTeamId, match.tournament.id);

    // 📌 Obsługa meczu dla zwycięzcy
    if (match.next_match_win) {
      const nextMatchWin = await this.matchRepository.findOne({
        where: { match_id: match.next_match_win, tournament: { id: match.tournament.id } },
        relations: ['team1', 'team2', 'tournament'],
      });

      if (nextMatchWin) {
        const teamToAssign = await this.teamRepository.findOneOrFail({ where: { id: winningTeamId } });

        if (!nextMatchWin.team1) {
          nextMatchWin.team1 = teamToAssign;
        } else if (!nextMatchWin.team2) {
          nextMatchWin.team2 = teamToAssign;
        } else {
          console.warn(`Next match ${match.next_match_win} already has both teams assigned.`);
        }

        await this.matchRepository.save(nextMatchWin);
      }
    }

    // 📌 Obsługa meczu dla przegranego
    if (match.next_match_lose && losingTeamId) {
      const nextMatchLose = await this.matchRepository.findOne({
        where: { match_id: match.next_match_lose, tournament: { id: match.tournament.id } },
        relations: ['team1', 'team2'],
      });

      if (nextMatchLose) {
        const teamToAssign = await this.teamRepository.findOneOrFail({ where: { id: losingTeamId } });

        if (!nextMatchLose.team1) {
          nextMatchLose.team1 = teamToAssign;
        } else if (!nextMatchLose.team2) {
          nextMatchLose.team2 = teamToAssign;
        } else {
          console.warn(`Next match ${match.next_match_lose} already has both teams assigned.`);
        }

        await this.matchRepository.save(nextMatchLose);
      }
    }
  }

  /**
  * 🛑 Funkcja usuwa stare przypisanie drużyn, jeśli zmienia się zwycięzca lub przegrany.
  */
  async clearNextMatchAssignment(nextMatchId: number | null, teamId: number | undefined, tournamentId: number) {
    if (!nextMatchId || !teamId) return;

    const nextMatch = await this.matchRepository.findOne({
      where: { match_id: nextMatchId, tournament: { id: tournamentId } },
      relations: ['team1', 'team2'],
    });

    if (nextMatch) {
      if (nextMatch.team1?.id === teamId) {
        nextMatch.team1 = null;
      } else if (nextMatch.team2?.id === teamId) {
        nextMatch.team2 = null;
      }

      await this.matchRepository.save(nextMatch);
    }
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
        'match.court',
        'match.scheduledTime',
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

  async getMatchResult(matchId: number): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['team1', 'team2', 'sets'], // Załaduj powiązane encje jeśli są potrzebne                           
    });

    if (!match) {
      throw new NotFoundException(`Mecz o ID ${matchId} nie został znaleziony.`);
    }

    return match;
  }

  async updateMatchDetails(matchId: number, updateMatchDetailsDto: UpdateMatchDetailsDto): Promise<Match> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });

    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    const { scheduledTime, court } = updateMatchDetailsDto;

    // Sprawdzenie, czy oba pola są dostarczone                                                                 
    if (!scheduledTime || court === undefined || court === null) {
      throw new BadRequestException('Both scheduledTime and court are required');
    }

    const parsedDate = new Date(scheduledTime);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date format for scheduledTime');
    }

    match.scheduledTime = parsedDate;
    match.court = Number(court); // Upewnij się, że court jest liczbą                                           

    return this.matchRepository.save(match);
  }
}