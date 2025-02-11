import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Match } from '../match/match.entity';

@Entity()
export class Set {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Match, (match) => match.sets, { onDelete: 'CASCADE' })
  match!: Match;

  @Column()
  team1_score!: number;

  @Column()
  team2_score!: number;

  @Column()
  set_number!: number; // Numer seta (1, 2, 3, itd.)
}