import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Set } from './set.entity';
import { SetService } from './set.service';
import { SetController } from './set.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Set])],
  providers: [SetService],
  controllers: [SetController],
  exports: [SetService], // Udostępniamy SetService dla innych modułów
})
export class SetModule {}