import { IsString, IsEmail, IsOptional, IsEnum, IsMongoId, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/roles.enum';

export class CreateUserDto {
    @ApiProperty({ example: 'kaan@futkids.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    password: string;

    @ApiProperty({ example: 'Kaan Ünal' })
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'PLAYER', enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiPropertyOptional({ example: '507f1f77bcf86cd799439011' })
    @IsMongoId()
    @IsOptional()
    academy?: string;

    @ApiPropertyOptional({ example: '+90 555 123 4567' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    playerProfile?: {
        position?: string;
        rating?: number;
        stats?: {
            pace?: number;
            shooting?: number;
            passing?: number;
            dribbling?: number;
            defending?: number;
            physical?: number;
        };
        parent?: string;
        nutritionPlan?: string;
    };
}
