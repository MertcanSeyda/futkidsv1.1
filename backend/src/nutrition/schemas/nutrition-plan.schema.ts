import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NutritionPlanDocument = NutritionPlan & Document;

@Schema({ timestamps: true })
export class NutritionPlan {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    player: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ type: Object })
    dailyPlans: Record<string, { // keys: 'monday', 'tuesday', etc.
        breakfast: string;
        lunch: string;
        dinner: string;
        snacks: string;
    }>;

    @Prop()
    notes?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;
}

export const NutritionPlanSchema = SchemaFactory.createForClass(NutritionPlan);
