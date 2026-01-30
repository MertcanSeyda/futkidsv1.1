import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NutritionPlan, NutritionPlanDocument } from './schemas/nutrition-plan.schema';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';

@Injectable()
export class NutritionService {
    constructor(
        @InjectModel(NutritionPlan.name) private nutritionModel: Model<NutritionPlanDocument>,
    ) { }

    async create(createNutritionPlanDto: CreateNutritionPlanDto) {
        const planData: any = { ...createNutritionPlanDto };
        if (createNutritionPlanDto.player) {
            planData.player = new Types.ObjectId(createNutritionPlanDto.player);
        }
        return await this.nutritionModel.create(planData);
    }

    async findAll(playerId?: string) {
        const filter: any = {};
        if (playerId && Types.ObjectId.isValid(playerId)) {
            filter.player = new Types.ObjectId(playerId);
        }
        return this.nutritionModel.find(filter).sort({ startDate: -1 }).exec();
    }

    async findOne(id: string) {
        const plan = await this.nutritionModel.findById(id).exec();
        if (!plan) throw new NotFoundException(`Nutrition Plan with ID ${id} not found`);
        return plan;
    }

    async update(id: string, updateNutritionDto: any) {
        const plan = await this.nutritionModel.findByIdAndUpdate(id, updateNutritionDto, { new: true }).exec();
        if (!plan) throw new NotFoundException(`Nutrition Plan with ID ${id} not found`);
        return plan;
    }

    async remove(id: string) {
        const plan = await this.nutritionModel.findByIdAndDelete(id).exec();
        if (!plan) throw new NotFoundException(`Nutrition Plan with ID ${id} not found`);
        return { message: 'Nutrition Plan deleted successfully' };
    }
}
