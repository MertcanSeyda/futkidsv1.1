import { IsNotEmpty, IsDateString, IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export class CreateMatchDto {
    @IsNotEmpty()
    @IsString()
    opponent: string;

    @IsNotEmpty()
    @IsDateString()
    date: Date;

    @IsNotEmpty()
    @IsString()
    time: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsEnum(['HOME', 'AWAY'])
    homeOrAway: string;

    @IsOptional()
    @IsString()
    result?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsMongoId()
    academy?: string;
}
