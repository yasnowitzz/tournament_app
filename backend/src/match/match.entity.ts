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

  @Column({ nullable: true })
  stage!: string;

  @Column({ nullable: true })                                                                                   
  court!: number; // Nowe pole dla boiska                                                                       
                                                                                                                
  @Column({ type: 'timestamp', nullable: true })                                                                
  scheduledTime!: Date; // Nowe pole dla czasu meczu

  @OneToMany(() => Set, (set) => set.match, { cascade: true })
  sets!: Set[];
}