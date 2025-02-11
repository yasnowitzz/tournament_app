import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { Tournament } from './tournament.entity';
import { Team } from '../team/team.entity';  // ✅ Import Team entity


@Module({
  imports: [TypeOrmModule.forFeature([Tournament, Team])],
  controllers: [TournamentController],
  providers: [TournamentService],
  exports: [TypeOrmModule], // ✅ Export TypeOrmModule so other modules can use TournamentRepository

})
export class TournamentModule {}
