import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { Tournament } from '../tournament/tournament.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id!: number;

  // @Column()
  // name!: string;

  // @ManyToOne(() => User, user => user.teams)
  // owner!: User;

  @ManyToMany(() => Tournament, (tournament) => tournament.teams)
  tournaments!: Tournament[];

  @ManyToOne(() => User, { nullable: false })
  player1!: User;  // Logged-in user

  @ManyToOne(() => User, { nullable: false })
  player2!: User;  // Partner (may not have an account)
}