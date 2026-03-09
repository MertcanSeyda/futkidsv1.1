import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Academy } from '../academies/schemas/academy.schema';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

  // --- Coach Comments ---
  async addComment(studentId: string, coachId: string, comment: string) {
    const student = await this.studentModel.findByIdAndUpdate(
      studentId,
      {
        $push: {
          coachComments: {
            coach: new Types.ObjectId(coachId),
            comment,
            date: new Date(),
          },
        },
      },
      { new: true },
    )
      .populate('coachComments.coach', 'fullName')
      .exec();

    if (!student) {
      throw new NotFoundException(`Student #${studentId} not found`);
    }
    return student;
  }

  async updateComment(studentId: string, commentId: string, comment: string) {
    const student = await this.studentModel.findOneAndUpdate(
      { _id: studentId, 'coachComments._id': commentId },
      { $set: { 'coachComments.$.comment': comment } },
      { new: true },
    )
      .populate('coachComments.coach', 'fullName')
      .exec();

    if (!student) {
      throw new NotFoundException(`Student or comment not found`);
    }
    return student;
  }

  async deleteComment(studentId: string, commentId: string) {
    const student = await this.studentModel.findByIdAndUpdate(
      studentId,
      {
        $pull: {
          coachComments: { _id: new Types.ObjectId(commentId) },
        },
      },
      { new: true },
    )
      .populate('coachComments.coach', 'fullName')
      .exec();

    if (!student) {
      throw new NotFoundException(`Student #${studentId} not found`);
    }
    return student;
  }

  // --- Playstyles ---
  async addPlaystyle(studentId: string, title: string, description: string) {
    const student = await this.studentModel.findByIdAndUpdate(
      studentId,
      { $push: { playstyles: { title, description, active: true } } },
      { new: true },
    ).exec();

    if (!student) throw new NotFoundException(`Student #${studentId} not found`);
    return student;
  }

  async updatePlaystyle(studentId: string, playstyleId: string, data: { title?: string; description?: string; active?: boolean }) {
    const updateFields: any = {};
    if (data.title !== undefined) updateFields['playstyles.$.title'] = data.title;
    if (data.description !== undefined) updateFields['playstyles.$.description'] = data.description;
    if (data.active !== undefined) updateFields['playstyles.$.active'] = data.active;

    const student = await this.studentModel.findOneAndUpdate(
      { _id: studentId, 'playstyles._id': playstyleId },
      { $set: updateFields },
      { new: true },
    ).exec();

    if (!student) throw new NotFoundException(`Student or playstyle not found`);
    return student;
  }

  async deletePlaystyle(studentId: string, playstyleId: string) {
    const student = await this.studentModel.findByIdAndUpdate(
      studentId,
      { $pull: { playstyles: { _id: playstyleId } } },
      { new: true }
    ).exec();
    
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  // --- AI Report Generation ---
  async generateAiReport(id: string) {
    const student = await this.findOne(id);
    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const ai = new GoogleGenerativeAI(apiKey);
    
    const birthDate = student.birthDate ? new Date(student.birthDate) : null;
    let ageStr = '--';
    if (birthDate) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      ageStr = age.toString();
    }

    const coachNotesStr = student.coachComments?.length 
      ? student.coachComments.map(c => `- ${c.comment}`).join('\n') 
      : 'Antrenör notu bulunmuyor.';
      
    const playstylesStr = student.playstyles?.length
      ? student.playstyles.filter(p => p.active).map(p => `- ${p.title}: ${p.description}`).join('\n')
      : 'Belirgin bir oyun stili eklenmemiş.';

    const prompt = `
# FUTKIDS PROFESYONEL SCOUT ANALİZİ

Aşağıdaki verileri inceleyerek üst düzey bir futbol izleme (scout) raporu hazırla. 
Dilin çok profesyonel, analitik ve bir futbol direktörüne sunulacak ciddiyette olsun. Motivasyonu yüksek ama gerçekçi bir ton kullan.

[VERİ SETİ]
- Sporcu: ${student.fullName}
- Mevki: ${student.position}
- Fiziksel: ${student.height || '--'}cm / ${student.weight || '--'}kg / ${ageStr} Yaş
- Teknik Puanlar: Hız:${student.stats?.pace}, Şut:${student.stats?.shooting}, Pas:${student.stats?.passing}, Top Sürme:${student.stats?.dribbling}, Defans:${student.stats?.defending}, Fizik:${student.stats?.physical} (OVR: ${student.rating})
- Özel Yetenekler: ${playstylesStr}
- Gözlemci Notları: ${coachNotesStr}

RAPOR FORMATI (Markdown):
1. **[STRATEJİK PROFİL]**: Oyuncunun oyun karakteristiğini 2-3 cümlede özetle.
2. **[ELİT YETENEKLER]**: Verilere ve notlara dayanarak en fark yaratan yönlerini analiz et.
3. **[KRİTİK GELİŞİM ALANLARI]**: Zayıf olduğu metricleri ve antrenör notlarındaki eksikleri profesyonelce yorumla.
4. **[GELECEK PROJEKSİYONU]**: Potansiyel tavanını ve sonraki adımlar için teknik tavsiyelerini yaz.
`;

    try {
      const response = await ai.getGenerativeModel({ model: 'gemini-2.5-flash' }).generateContent(prompt);
      return { report: response.response.text() || "Rapor oluşturulamadı." };
    } catch (error: any) {
      console.error("Gemini API Error in backend:", error);
      throw new Error("AI raporu oluşturulurken bir hata meydana geldi: " + error.message);
    }
  }
}
