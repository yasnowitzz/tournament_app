import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../user/user.entity';
import { Tournament } from '../tournament/tournament.entity';
import { UserService } from '../user/user.service';


@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
    @InjectRepository(Tournament)
    private tournamentRepository: Repository<Tournament>,
    private readonly userService: UserService,
  ) {}

  // async create(data: { name: string; ownerId: number }) {
  //   const team = this.teamRepo.create(data);
  //   return this.teamRepo.save(team);
  // }

  async getTeamsByOwner(ownerId: number) {
    return this.teamRepo.createQueryBuilder('team')
      .leftJoinAndSelect('team.owner', 'owner')
      .where('owner.id = :ownerId', { ownerId })
      .getMany();
  }

  async registerTeamForTournament(
    tournamentId: number,
    player1: User,
    partnerDetails: { firstName: string; lastName: string; email: string }
  ): Promise<Team> {
    const tournament = await this.tournamentRepository.findOne({
      where: { id: tournamentId },
      relations: ['teams', 'teams.player1', 'teams.player2'], 
    });
  
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    console.log('Tournament:', tournament);                                                               
    tournament.teams.forEach((team, index) => {                                                           
      console.log(`Team ${index + 1}:`, team);                                                            
    });
  
    // Sprawdzenie, czy player1 już jest zapisany w jakiejś drużynie w tym turnieju
    const existingTeam = tournament.teams.find(
      (t) => t.player1.id === player1.id || t.player2.id === player1.id
    );
  
    if (existingTeam) {
      throw new BadRequestException('Player is already registered with a partner in this tournament');
    }
  
    // Znalezienie lub utworzenie partnera
    const player2 = await this.userService.findOrCreateUser(
      partnerDetails.firstName,
      partnerDetails.lastName,
      partnerDetails.email
    );
  
    // Sprawdzenie, czy drużyna już istnieje
    let team = await this.teamRepo.findOne({
      where: [
        { player1, player2 },
        { player1: player2, player2: player1 }, // Obsługa obu możliwych kolejności zawodników
      ],
    });
  
    if (!team) {
      team = new Team();
      team.player1 = player1;
      team.player2 = player2;
      await this.teamRepo.save(team);
    }
  
    // Zapisanie drużyny do turnieju (jeśli nie jest już zapisana)
    if (!tournament.teams.some((t) => t.id === team.id)) {
      tournament.teams.push(team);
      await this.tournamentRepository.save(tournament);
    } else {
      throw new BadRequestException('Team already registered for this tournament');
    }
  
    return team;
  }

  async getTeamsByTournament(tournamentId: number) {
    return this.teamRepo
      .createQueryBuilder('team')
      .innerJoinAndSelect('team.player1', 'player1')
      .innerJoinAndSelect('team.player2', 'player2')
      .innerJoin('team.tournaments', 'tournament')
      .where('tournament.id = :tournamentId', { tournamentId })
      .select([
        'team.id',
        'player1.firstName',
        'player1.lastName',
        'player2.firstName',
        'player2.lastName',
      ])
      .getMany();
  }
}