import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { Tournament } from '../tournament/tournament.entity';
import { Team } from '../team/team.entity';
import { Set } from '../set/set.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  match_id!: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.matches)
  tournament!: Tournament;

  @ManyToOne(() => Team, { nullable: true })
  team1!: Team | null;

  @ManyToOne(() => Team, { nullable: true })
  team2!: Team | null;

  @Column({ nullable: true })
  next_match_win!: number;

  @Column({ nullable: true })
  next_match_lose!: number;

  @Column({ nullable: true })
  winner!: number; // ID zwycięskiej drużyny

  @OneToMany(() => Set, (set) => set.match, { cascade: true })
  sets!: Set[];

  @Column({ nullable: true })
  stage!: string;
}