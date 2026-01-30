import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TacticDocument = Tactic & Document;

@Schema({ timestamps: true })
export class Tactic {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    type: string; // 'formation', 'drill', 'set_piece'

    @Prop({ default: false })
    isPreset: boolean;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    creator: any;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Academy' })
    academy: any;

    @Prop({ type: Array, required: true })
    frames: any[]; // Array of frames with token positions

    @Prop({ type: Object })
    thumbnail: any; // Optional thumbnail or preview data
}

export const TacticSchema = SchemaFactory.createForClass(Tactic);
