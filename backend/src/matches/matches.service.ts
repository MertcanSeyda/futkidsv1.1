import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Match, MatchDocument } from './schemas/match.schema';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchesService {
    constructor(
        @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
    ) { }

    async create(createMatchDto: CreateMatchDto) {
        const matchData: any = { ...createMatchDto };
        if (createMatchDto.academy) {
            matchData.academy = new Types.ObjectId(createMatchDto.academy);
        }
        return await this.matchModel.create(matchData);
    }

    async findAll(academyId?: string) {
        const filter: any = {};
        if (academyId && Types.ObjectId.isValid(academyId)) {
            filter.academy = new Types.ObjectId(academyId);
        }
        return this.matchModel.find(filter).sort({ date: 1 }).exec();
    }

    async findOne(id: string) {
        const match = await this.matchModel.findById(id).exec();
        if (!match) throw new NotFoundException(`Match with ID ${id} not found`);
        return match;
    }

    async update(id: string, updateMatchDto: any) {
        const match = await this.matchModel.findByIdAndUpdate(id, updateMatchDto, { new: true }).exec();
        if (!match) throw new NotFoundException(`Match with ID ${id} not found`);
        return match;
    }

    async remove(id: string) {
        const match = await this.matchModel.findByIdAndDelete(id).exec();
        if (!match) throw new NotFoundException(`Match with ID ${id} not found`);
        return { message: 'Match deleted successfully' };
    }
}
