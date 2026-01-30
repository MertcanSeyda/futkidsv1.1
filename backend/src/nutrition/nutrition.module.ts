import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { NutritionPlan, NutritionPlanSchema } from './schemas/nutrition-plan.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: NutritionPlan.name, schema: NutritionPlanSchema }]),
    ],
    controllers: [NutritionController],
    providers: [NutritionService],
    exports: [NutritionService],
})
export class NutritionModule { }
