import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Academy } from '../academies/schemas/academy.schema';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Academy.name) private academyModel: Model<Academy>,
  ) { }

  async create(createStudentDto: CreateStudentDto) {
    try {
      const studentData: any = { ...createStudentDto };

      // Convert string IDs to ObjectIds
      if (studentData.academy) {
        studentData.academy = new Types.ObjectId(studentData.academy);
      }

      if (studentData.parent) {
        if (studentData.parent === "" || studentData.parent === "undefined") {
          delete studentData.parent;
        } else {
          studentData.parent = new Types.ObjectId(studentData.parent);
        }
      } else {
        delete studentData.parent;
      }

      // Calculate initial rating average if stats exist
      if (studentData.stats) {
        const stats = Object.values(studentData.stats) as number[];
        const sum = stats.reduce((a, b) => a + b, 0);
        studentData.rating = Math.round(sum / 6);
      }

      const student = await this.studentModel.create(studentData);

      // Increment player count in Academy
      await this.academyModel.findByIdAndUpdate(studentData.academy, { $inc: { playerCount: 1 } });

      return student;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async findAll(academyId?: string, parentId?: string) {
    const filter: any = {};

    if (academyId) {
      if (Types.ObjectId.isValid(academyId)) {
        filter.academy = new Types.ObjectId(academyId);
      }
    }

    if (parentId) {
      if (Types.ObjectId.isValid(parentId)) {
        filter.parent = new Types.ObjectId(parentId);
      }
    }

    return this.studentModel.find(filter)
      .populate('parent', 'fullName email phone')
      .populate('academy', 'name')
      .populate('coachComments.coach', 'fullName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const student = await this.studentModel.findById(id)
      .populate('parent', 'fullName email phone')
      .populate('academy', 'name')
      .populate('coachComments.coach', 'fullName')
      .exec();

    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }
    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    const updateData: any = { ...updateStudentDto };

    // Convert IDs if present
    if (updateData.academy) updateData.academy = new Types.ObjectId(updateData.academy);

    if (updateData.parent !== undefined) {
      if (updateData.parent === "" || updateData.parent === null) {
        updateData.parent = undefined; // should use $unset but mongoose might handle null
        // for simplicity let's delete if empty string, but to remove field we might need $unset which mongoose handles if we pass null usually
      } else {
        updateData.parent = new Types.ObjectId(updateData.parent);
      }
    }

    // Recalculate rating if stats are updated
    if (updateData.stats) {
      const stats = Object.values(updateData.stats) as number[];
      const sum = stats.reduce((a, b) => a + b, 0);
      updateData.rating = Math.round(sum / 6);
    }

    const student = await this.studentModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }
    return student;
  }

  async remove(id: string) {
    const student = await this.studentModel.findByIdAndDelete(id).exec();

    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }

    // Decrement player count
    await this.academyModel.findByIdAndUpdate(student.academy, { $inc: { playerCount: -1 } });

    return student;
  }
}
