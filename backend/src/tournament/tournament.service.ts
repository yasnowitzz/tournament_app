import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Tournament } from './tournament.entity';

@Injectable()
export class TournamentService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepo: Repository<Tournament>,
  ) { }

  async findById(id: number): Promise<Tournament | undefined> {
    const tournament = await this.tournamentRepo.findOne({ where: { id } });
    return tournament ?? undefined;
  }

  async getAll(): Promise<Tournament[]> {
    return await this.tournamentRepo.find();
  }

  async create(tournamentData: Partial<Tournament>): Promise<Tournament> {
    try {
      const sanitizedData: DeepPartial<Tournament> = {
        ...tournamentData,
        numTeams: tournamentData.numTeams ? Number(tournamentData.numTeams) : 0,
        numCourts: tournamentData.numCourts ? Number(tournamentData.numCourts) : 0,
        breakDuration: tournamentData.breakDuration ? Number(tournamentData.breakDuration) : 0,
        numSeededTeams: tournamentData.numSeededTeams ? Number(tournamentData.numSeededTeams) : undefined, // ⬅️ Use `undefined` instead of `null`
        lunchBreakDuration: tournamentData.lunchBreakDuration ? Number(tournamentData.lunchBreakDuration) : undefined,
        tieBreakFormat: tournamentData.tieBreakFormat ? Number(tournamentData.tieBreakFormat) : undefined,
        matchDuration: tournamentData.matchDuration ? Number(tournamentData.matchDuration) : 0, // Nowe pole      
        tournamentDescription: tournamentData.tournamentDescription ?? '', // Nowe pole  
      };

      console.log('Sanitized Tournament Data:', sanitizedData); // Debugging

      const tournament = this.tournamentRepo.create(sanitizedData);
      return await this.tournamentRepo.save(tournament);
    } catch (error) {
      console.error('Error saving tournament:', error);
      throw new Error('Failed to create tournament');
    }
  }
}
