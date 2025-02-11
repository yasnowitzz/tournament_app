import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './match.entity';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { Team } from '../team/team.entity';
import { SetModule } from '../set/set.module';
import { TournamentModule } from '../tournament/tournament.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Team]),  // Ensure Match & Team entities are included
    TournamentModule,                         // ✅ Import TournamentModule
    SetModule,                                // ✅ Import SetModule
  ],
  providers: [MatchService],
  controllers: [MatchController],
})
export class MatchModule {}