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
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
  ) {}

  async saveMatchSets(match: Match, setResults: { team1_score: number, team2_score: number }[]) {  
    const sets = setResults.map((setResult, index) => {
      const set = new Set();
      set.match = match; // Przypisanie meczu
      set.team1_score = setResult.team1_score;
      set.team2_score = setResult.team2_score;
      set.set_number = index + 1;
      console.log(`Set before save:`, set); // Debug
      return set;
    });
  
    // Wymuś przypisanie do `match.sets`
    match.sets = [...match.sets, ...sets];
  
    console.log("Match with new sets:", match);
  
    await this.matchRepository.save(match); // Wymuszenie zapisu meczu przed zapisaniem setów
    return this.setRepository.save(sets);
  }

  async getSetsByMatchId(matchId: number): Promise<Set[]> {
    return this.setRepository.find({ where: { match: { id: matchId } } });
  }
}