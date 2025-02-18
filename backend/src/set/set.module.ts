import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Set } from './set.entity';
import { Match } from '../match/match.entity';
import { SetService } from './set.service';
import { SetController } from './set.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Set, Match])],
  providers: [SetService],
  controllers: [SetController],
  exports: [SetService, TypeOrmModule], // Udostępniamy SetService dla innych modułów
})
export class SetModule {}