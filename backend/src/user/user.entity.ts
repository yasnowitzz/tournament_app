// import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Team } from '../team/team.entity';

export enum UserRole {
  ADMIN = 'admin',
  PLAYER = 'player',
  GUEST = 'guest'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })             
  email!: string; 

  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lastName!: string;

  @Column({ type: 'enum', enum: UserRole, enumName: 'user_role_enum', default: UserRole.PLAYER })
  role!: UserRole;

  @Column({ nullable: true })  // ✅ Allows missing passwords for auto-created users
  password?: string;

  @OneToMany(() => Team, (team) => team.player1)
  teamsAsPlayer1!: Team[];

  @OneToMany(() => Team, (team) => team.player2)
  teamsAsPlayer2!: Team[];
}
