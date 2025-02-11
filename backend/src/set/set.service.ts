import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Set } from './set.entity';
import { Match } from '../match/match.entity';

@Injectable()
export class SetService {
  constructor(
    @InjectRepository(Set)
    private setRepository: Repository<Set>,
  ) {}

  async saveMatchSets(match: Match, setResults: { team1_score: number, team2_score: number }[]) {
    const sets = setResults.map((setResult, index) => {
      const set = new Set();
      set.match = match;
      set.team1_score = setResult.team1_score;
      set.team2_score = setResult.team2_score;
      set.set_number = index + 1;
      return set;
    });

    return this.setRepository.save(sets);
  }

  async getSetsByMatchId(matchId: number): Promise<Set[]> {
    return this.setRepository.find({ where: { match: { id: matchId } } });
  }
}