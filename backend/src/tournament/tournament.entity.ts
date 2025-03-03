import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable, ManyToMany } from 'typeorm';
import { Match } from '../match/match.entity';
import { Team } from '../team/team.entity';

@Entity()
export class Tournament {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  numTeams!: number;

  @Column()
  numCourts!: number;

  @Column({ type: 'timestamp' })                                                                                  
  startTime!: Date; 

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

  @Column({ type: 'text' }) // Nowe pole                                                                          
  tournamentDescription!: string;                                                                                 
                                                                                                                  
  @Column({ type: 'int' }) // Nowe pole                                                                           
  matchDuration!: number; 

  @ManyToMany(() => Team, (team) => team.tournaments)
  @JoinTable({ name: 'tournament_teams' })  // ✅ This creates the join table
  teams!: Team[];

  @OneToMany(() => Match, (match) => match.tournament, { cascade: true })
  matches!: Match[];
}