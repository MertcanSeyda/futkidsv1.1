import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MatchDocument = Match & Document;

@Schema({ timestamps: true })
export class Match {
    @Prop({ type: Types.ObjectId, ref: 'Academy', required: true })
    academy: Types.ObjectId;

    @Prop({ required: true })
    opponent: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    time: string;

    @Prop({ required: true })
    location: string;

    @Prop({ enum: ['HOME', 'AWAY'], default: 'HOME' })
    homeOrAway: string;

    @Prop()
    result?: string;

    @Prop({ default: 'UPCOMING' }) // UPCOMING, PLAYED, CANCELLED
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;
}

export const MatchSchema = SchemaFactory.createForClass(Match);
