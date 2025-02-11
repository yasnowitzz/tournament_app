import { Controller, Get, Param } from '@nestjs/common';
import { SetService } from './set.service';

@Controller('sets')
export class SetController {
  constructor(private readonly setService: SetService) {}

  @Get('match/:matchId')
  async getSetsForMatch(@Param('matchId') matchId: number) {
    return this.setService.getSetsByMatchId(matchId);
  }
}