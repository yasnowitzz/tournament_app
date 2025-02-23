import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Set } from './set.entity';
import { Match } from '../match/match.entity';
import { SetService } from './set.service';


@Module({
  imports: [TypeOrmModule.forFeature([Set, Match])],
  providers: [SetService],
  exports: [SetService, TypeOrmModule], // Udostępniamy SetService dla innych modułów
})
export class SetModule {}