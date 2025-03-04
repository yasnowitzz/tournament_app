import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';

export class UpdateMatchDetailsDto {
    @IsOptional()
    @IsDateString()
    scheduledTime?: string;

    @IsOptional()
    @IsNumber()
    court?: number;
}                                                                                                               