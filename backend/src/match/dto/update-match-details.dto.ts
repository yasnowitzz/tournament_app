import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateMatchDetailsDto {
    @IsOptional()
    @IsDateString()
    scheduledTime?: string;

    @IsOptional()
    @IsString()
    court?: number;
}                                                                                                               