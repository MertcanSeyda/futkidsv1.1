import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tactic, TacticDocument } from './schemas/tactic.schema';
import { CreateTacticDto } from './dto/create-tactic.dto';

@Injectable()
export class TacticsService {
    constructor(@InjectModel(Tactic.name) private tacticModel: Model<TacticDocument>) { }

    async create(createTacticDto: CreateTacticDto, userId: string): Promise<Tactic> {
        const tactic = new this.tacticModel({
            ...createTacticDto,
            creator: userId,
        });
        return tactic.save();
    }

    async findAll(academyId: string): Promise<Tactic[]> {
        // Find custom tactics for academy OR presets
        return this.tacticModel.find({
            $or: [
                { academy: academyId },
                { isPreset: true }
            ]
        }).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<Tactic | null> {
        return this.tacticModel.findById(id).exec();
    }

    async remove(id: string): Promise<any> {
        return this.tacticModel.findByIdAndDelete(id).exec();
    }
}
