import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Academy } from './schemas/academy.schema';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { UpdateAcademyDto } from './dto/update-academy.dto';

@Injectable()
export class AcademiesService {
    constructor(
        @InjectModel(Academy.name) private academyModel: Model<Academy>,
    ) { }

    async create(createAcademyDto: CreateAcademyDto) {
        const academy = await this.academyModel.create(createAcademyDto);
        return academy;
    }

    async findAll() {
        return this.academyModel.find().populate('owner', 'fullName email').exec();
    }

    async findOne(id: string) {
        const academy = await this.academyModel
            .findById(id)
            .populate('owner', 'fullName email')
            .exec();

        if (!academy) {
            throw new NotFoundException(`Academy with ID ${id} not found`);
        }

        return academy;
    }

    async update(id: string, updateAcademyDto: UpdateAcademyDto) {
        const academy = await this.academyModel
            .findByIdAndUpdate(id, updateAcademyDto, { new: true })
            .exec();

        if (!academy) {
            throw new NotFoundException(`Academy with ID ${id} not found`);
        }

        return academy;
    }

    async remove(id: string) {
        const academy = await this.academyModel.findByIdAndDelete(id).exec();

        if (!academy) {
            throw new NotFoundException(`Academy with ID ${id} not found`);
        }

        return { message: 'Academy deleted successfully' };
    }
}
