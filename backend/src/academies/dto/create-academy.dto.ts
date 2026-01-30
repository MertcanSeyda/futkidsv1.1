import { IsString, IsOptional, IsMongoId, IsEmail, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademyDto {
    @ApiProperty({ example: 'FUTKIDS İstanbul Akademisi' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Kadıköy Mahallesi, Futbol Sokak No:1' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ example: 'İstanbul' })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({ example: '+90 555 123 4567' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 'info@futkids.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
    @IsString()
    @IsOptional()
    logoUrl?: string;

    @ApiPropertyOptional({ example: 2020 })
    @IsNumber()
    @IsOptional()
    foundedYear?: number;

    @ApiPropertyOptional({ example: 'Profesyonel futbol eğitimi veren akademi' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
    @IsMongoId()
    @IsOptional()
    owner?: string;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
