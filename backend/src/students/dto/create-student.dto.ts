import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsMongoId } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsDateString()
    @IsOptional()
    birthDate?: string;

    @IsString()
    @IsNotEmpty()
    position: string;

    @IsString()
    @IsOptional()
    teamCategory?: string;

    @IsNumber()
    @IsOptional()
    height?: number;

    @IsNumber()
    @IsOptional()
    weight?: number;

    @IsNumber()
    @IsOptional()
    rating?: number;

    @IsMongoId()
    @IsNotEmpty()
    academy: string;

    @IsMongoId()
    @IsOptional()
    parent?: string;

    @IsOptional()
    stats?: {
        pace: number;
        shooting: number;
        passing: number;
        dribbling: number;
        defending: number;
        physical: number;
    };

    @IsOptional()
    coachComments?: Array<{
        coach: string;
        comment: string;
        date: Date;
    }>;
}
