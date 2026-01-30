import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AcademyDocument = Academy & Document;

@Schema({ timestamps: true })
export class Academy {
    @Prop({ required: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    owner?: Types.ObjectId;

    @Prop()
    address?: string;

    @Prop()
    city?: string;

    @Prop()
    phone?: string;

    @Prop()
    email?: string;

    @Prop()
    logoUrl?: string;

    @Prop()
    foundedYear?: number;

    @Prop()
    description?: string;

    @Prop({ default: 0 })
    playerCount: number;

    @Prop({ default: 0 })
    coachCount: number;

    @Prop({ default: 0 })
    parentCount: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const AcademySchema = SchemaFactory.createForClass(Academy);
