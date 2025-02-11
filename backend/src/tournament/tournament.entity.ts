import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import { Match } from '../match/match.entity';
import { Team } from '../team/team.entity';

@Entity()
export class Tournament {
  @PrimaryGeneratedColumn()
  id!: number;

  // @Column()
  // name!: string;

  // @Column()
  // format!: string; // 'playoff', 'groups', 'brazilian'

  // @Column()
  // startDate!: Date;

  @Column()
  numTeams!: number;

  @Column()
  numCourts!: number;

  @Column()
  startTime!: string;

  @Column()
  type!: string; // 'classic' or 'king'

  @Column()
  breakDuration!: number;

  @Column({ default: false })
  hasLunchBreak!: boolean;

  @Column({ nullable: true })
  lunchBreakDuration?: number;

  @Column()
  seeding!: string; // 'random' or 'seeded'

  @Column({ nullable: true })
  numSeededTeams?: number;

  @Column()
  matchFormat!: string;

  @Column()
  setFormat!: string;

  @Column({ nullable: true })
  tieBreakFormat?: number;

  @Column()
  location!: string;

  @ManyToMany(() => Team, (team) => team.tournaments)
  @JoinTable({ name: 'tournament_teams' })  // ✅ This creates the join table
  teams!: Team[];

  @OneToMany(() => Match, (match) => match.tournament, { cascade: true })
  matches!: Match[];
}