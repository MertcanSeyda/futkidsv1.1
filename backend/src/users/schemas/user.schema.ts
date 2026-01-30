import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../common/enums/roles.enum';

export type UserDocument = User & Document;

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

@Schema({ _id: false })
export class CoachNote {
    @Prop({ required: true })
    note: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    coach: Types.ObjectId;

    @Prop({ default: Date.now })
    date: Date;
}

@Schema({ _id: false })
export class PlayerProfile {
    @Prop()
    position?: string; // LW, ST, CM, etc.

    @Prop({ default: 0 })
    rating: number;

    @Prop({ type: PlayerStats, default: () => ({}) })
    stats: PlayerStats;

    @Prop({ type: [CoachNote], default: [] })
    coachNotes: CoachNote[];

    @Prop()
    nutritionPlan?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    parent?: Types.ObjectId; // Link to parent
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, enum: UserRole, default: UserRole.PARENT })
    role: UserRole;

    @Prop({ type: Types.ObjectId, ref: 'Academy' })
    academy?: Types.ObjectId;

    @Prop()
    phone?: string;

    // Player-specific fields
    @Prop({ type: SchemaFactory.createForClass(PlayerProfile) })
    playerProfile?: PlayerProfile;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const PlayerProfileSchema = SchemaFactory.createForClass(PlayerProfile);
export const CoachNoteSchema = SchemaFactory.createForClass(CoachNote);
export const PlayerStatsSchema = SchemaFactory.createForClass(PlayerStats);
