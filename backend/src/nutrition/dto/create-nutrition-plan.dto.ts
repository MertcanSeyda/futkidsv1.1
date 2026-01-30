import { IsNotEmpty, IsString, IsDateString, IsOptional, IsObject, IsMongoId } from 'class-validator';

export class CreateNutritionPlanDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsDateString()
    startDate: Date;

    @IsNotEmpty()
    @IsDateString()
    endDate: Date;

    @IsObject()
    dailyPlans: Record<string, {
        breakfast: string;
        lunch: string;
        dinner: string;
        snacks: string;
    }>;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsNotEmpty()
    @IsMongoId()
    player: string;
}
