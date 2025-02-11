import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Tournament } from '../tournament/tournament.entity'; // ✅ Import Tournament entity
import { TournamentModule } from '../tournament/tournament.module'; // ✅ Import TournamentModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, User, Tournament]), // ✅ Register Team, User, and Tournament repositories
    TournamentModule, // ✅ Ensure TeamModule knows about TournamentModule
  ],
  providers: [TeamService, UserService],
  controllers: [TeamController],
  exports: [TypeOrmModule], // ✅ Export TypeOrmModule so it can be used elsewhere
})
export class TeamModule {}