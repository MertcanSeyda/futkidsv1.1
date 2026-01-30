import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';

export class CreateTacticDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsBoolean()
    @IsOptional()
    isPreset: boolean;

    @IsOptional()
    academy: string;

    @IsArray()
    @IsNotEmpty()
    frames: any[];
}
