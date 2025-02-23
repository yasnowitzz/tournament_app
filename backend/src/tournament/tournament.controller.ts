import { Controller, Param, Get, Post, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { Tournament } from './tournament.entity';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('tournaments')
export class TournamentController {
    constructor(private readonly tournamentService: TournamentService) { }

    @Get()
    async getAll(): Promise<Tournament[]> {
        return await this.tournamentService.getAll();
    }

    @Get(':id')
    async findById(@Param('id') id: number): Promise<Tournament> {
        const tournament = await this.tournamentService.findById(id);
        if (!tournament) {
            throw new NotFoundException(`Tournament with id ${id} not found`);
        }
        return tournament;
    }

    @Post()
    @Roles('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async create(@Body() tournamentData: Partial<Tournament>): Promise<Tournament> {
        console.log('Creating tournament:', tournamentData);
        return this.tournamentService.create(tournamentData);
    }
}
