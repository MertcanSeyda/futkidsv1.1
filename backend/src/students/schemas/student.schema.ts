import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentDocument = Student & Document;

@Schema({ _id: false })
export class PlayerStats {
    @Prop({ default: 0 })
    pace: number;

    @Prop({ default: 0 })
    shooting: number;

    @Prop({ default: 0 })
    passing: number;

    @Prop({ default: 0 })
    dribbling: number;

    @Prop({ default: 0 })
    defending: number;

    @Prop({ default: 0 })
    physical: number;
}

@Schema({ timestamps: true })
export class Student {
    @Prop({ required: true })
    fullName: string;

    @Prop({ type: Date })
    birthDate?: Date;

    @Prop()
    height?: number; // Boy (cm)

    @Prop()
    weight?: number; // Kilo (kg)

    @Prop()
    position: string;

    @Prop()
    teamCategory?: string; // U10, U11 vs

    @Prop({ type: Types.ObjectId, ref: 'Academy', required: true })
    academy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    parent?: Types.ObjectId;

    @Prop({ type: PlayerStats, default: () => ({ pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 }) })
    stats: PlayerStats;

    @Prop()
    photoUrl?: string;

    @Prop({ default: 0 })
    rating: number; // calculated from stats

    @Prop({
        type: [{
            coach: { type: Types.ObjectId, ref: 'User' },
            comment: String,
            date: { type: Date, default: Date.now }
        }],
        default: []
    })
    coachComments?: Array<{
        coach: Types.ObjectId;
        comment: string;
        date: Date;
    }>;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
export const PlayerStatsSchema = SchemaFactory.createForClass(PlayerStats);
