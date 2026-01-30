import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Academy } from '../academies/schemas/academy.schema';
import { Student } from '../students/schemas/student.schema';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/roles.enum';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Academy.name) private academyModel: Model<Academy>,
        @InjectModel(Student.name) private studentModel: Model<Student>,
    ) { }

    async onModuleInit() {
        // Otomatik her seferinde seed atmaması için kontrol edebilirsin 
        // ama temiz test için şimdilik force yapmıyorum, eğer db boşsa atacak.
    }

    async forceSeed() {
        console.log('🚀 Temizlik başlıyor...');
        await this.userModel.deleteMany({});
        await this.academyModel.deleteMany({});
        await this.studentModel.deleteMany({});

        console.log('🌱 Seed verileri oluşturuluyor...');
        return await this.seed();
    }

    async seed() {
        const password = await bcrypt.hash('123456', 10);

        // 1. ADMIN
        const admin = await this.userModel.create({
            email: 'admin@futkids.com',
            password,
            fullName: 'Atilla Admin',
            role: 'admin',
        });

        // 2. OWNERS
        const ownerMertcan = await this.userModel.create({
            email: 'mertcan@futkids.com',
            password,
            fullName: 'Mertcan Sahibi',
            role: 'owner',
        });

        const ownerAtilla = await this.userModel.create({
            email: 'atilla@futkids.com',
            password,
            fullName: 'Atilla Sahibi',
            role: 'owner',
        });

        // 3. ACADEMIES
        const academyMertcan = await this.academyModel.create({
            name: 'Mertcan Futbol Akademisi',
            address: 'Kadıköy, İstanbul',
            city: 'İstanbul',
            phone: '5551112233',
            email: 'info@mertcanakademi.com',
            owner: ownerMertcan._id,
            foundedYear: 2020,
            description: 'Geleceğin yıldızları burada yetişiyor.',
        });

        const academyAtilla = await this.academyModel.create({
            name: 'Antigravity Futbol Okulu',
            address: 'Beşiktaş, İstanbul',
            city: 'İstanbul',
            phone: '5554445566',
            email: 'info@atillafutbol.com',
            owner: ownerAtilla._id,
            foundedYear: 2022,
            description: 'Profesyonel altyapı eğitimi.',
        });

        const academyHamburg = await this.academyModel.create({
            name: 'Hamburg',
            address: 'Çankaya, Ankara',
            city: 'Ankara',
            phone: '5556667788',
            email: 'info@hamburg.com',
            foundedYear: 2021,
            description: 'Hamburg Futbol Okulu',
        });

        const academyMurat = await this.academyModel.create({
            name: 'Murat Hacıoğlu Futbol Okulu',
            address: 'Karşıyaka, İzmir',
            city: 'İzmir',
            phone: '5557778899',
            email: 'info@murat.com',
            foundedYear: 2019,
            description: 'İzmir\'in en köklü akademisi',
        });

        // 4. COACHES
        const coach1 = await this.userModel.create({
            email: 'coach1@futkids.com',
            password,
            fullName: 'Fatih Terim Coach',
            role: 'coach',
            academy: academyMertcan._id,
            phone: '5550001122'
        });

        const coach2 = await this.userModel.create({
            email: 'coach2@futkids.com',
            password,
            fullName: 'Okan Buruk Coach',
            role: 'coach',
            academy: academyAtilla._id,
            phone: '5550002233'
        });

        const coach3 = await this.userModel.create({
            email: 'coach3@futkids.com',
            password,
            fullName: 'Erhan Hamburg Coach',
            role: 'coach',
            academy: academyHamburg._id,
            phone: '5550003344'
        });

        // 5. PARENTS (Akademiye bağlı)
        const parent1 = await this.userModel.create({
            email: 'veli1@futkids.com',
            password,
            fullName: 'Mehmet Veli',
            role: 'parent',
            academy: academyMertcan._id, // Akademiye bağlı
            phone: '5558887766'
        });

        const parent2 = await this.userModel.create({
            email: 'veli2@futkids.com',
            password,
            fullName: 'Zeynep Veli',
            role: 'parent',
            academy: academyAtilla._id, // Akademiye bağlı
            phone: '5559998877'
        });

        const parent3 = await this.userModel.create({
            email: 'veli3@futkids.com',
            password,
            fullName: 'Hasan Veli',
            role: 'parent',
            academy: academyHamburg._id, // Akademiye bağlı
            phone: '5559997766'
        });

        // 6. STUDENTS (PLAYERS AS DATA)
        // Mertcan Akademisi Oyuncuları
        await this.studentModel.create({
            fullName: "Mert Küçük",
            birthDate: new Date('2012-03-15'),
            height: 165,
            weight: 55,
            position: "ST",
            teamCategory: "U14",
            rating: 72,
            academy: academyMertcan._id,
            parent: parent1._id,
            stats: { pace: 80, shooting: 85, passing: 70, dribbling: 82, defending: 40, physical: 75 },
            coachComments: [
                {
                    coach: coach1._id,
                    comment: "Şut tekniği çok iyi gelişiyor. Pas kalitesini artırmalı.",
                    date: new Date('2026-01-25')
                },
                {
                    coach: coach1._id,
                    comment: "Bugünkü antrenmanda harika performans gösterdi. Takım oyununa katkısı arttı.",
                    date: new Date('2026-01-28')
                }
            ]
        });

        await this.studentModel.create({
            fullName: "Can Yıldız",
            birthDate: new Date('2011-07-22'),
            height: 178,
            weight: 68,
            position: "GK",
            teamCategory: "U15",
            rating: 59,
            academy: academyMertcan._id,
            parent: parent1._id,
            stats: { pace: 50, shooting: 20, passing: 60, dribbling: 40, defending: 85, physical: 80 },
            coachComments: [
                {
                    coach: coach1._id,
                    comment: "Refleksleri mükemmel. Ayak oyununu geliştirmeli.",
                    date: new Date('2026-01-26')
                }
            ]
        });

        // Atilla Akademisi Oyuncuları
        await this.studentModel.create({
            fullName: "Arda Güler",
            birthDate: new Date('2010-05-10'),
            height: 170,
            weight: 62,
            position: "CAM",
            teamCategory: "U16",
            rating: 77,
            academy: academyAtilla._id,
            parent: parent2._id,
            stats: { pace: 85, shooting: 88, passing: 95, dribbling: 94, defending: 55, physical: 65 },
            coachComments: [
                {
                    coach: coach2._id,
                    comment: "Olağanüstü yetenek! Pas vizyonu ve teknik becerileri yaşının çok üstünde.",
                    date: new Date('2026-01-27')
                },
                {
                    coach: coach2._id,
                    comment: "Fiziksel gelişimine odaklanmalı. Savunma katkısını artırmalı.",
                    date: new Date('2026-01-29')
                }
            ]
        });

        await this.studentModel.create({
            fullName: "Erhan Pro",
            birthDate: new Date('2011-11-18'),
            height: 175,
            weight: 65,
            position: "ST",
            teamCategory: "U15",
            rating: 78,
            academy: academyAtilla._id,
            parent: parent2._id,
            stats: { pace: 89, shooting: 90, passing: 80, dribbling: 88, defending: 45, physical: 78 },
            coachComments: [
                {
                    coach: coach2._id,
                    comment: "Hız ve şut gücü harika. Takım oyununa daha fazla katılmalı.",
                    date: new Date('2026-01-24')
                }
            ]
        });

        // Hamburg Akademisi Oyuncuları
        await this.studentModel.create({
            fullName: "Erdal Tosun",
            birthDate: new Date('2009-01-05'),
            height: 185,
            weight: 75,
            position: "GK",
            teamCategory: "U17",
            rating: 61,
            academy: academyHamburg._id,
            parent: parent3._id,
            stats: { pace: 55, shooting: 30, passing: 65, dribbling: 45, defending: 88, physical: 85 },
            coachComments: [
                {
                    coach: coach3._id,
                    comment: "Kaleci pozisyonunda çok yetenekli. Savunma becerileri mükemmel.",
                    date: new Date('2026-01-23')
                },
                {
                    coach: coach3._id,
                    comment: "Ayak oyununu geliştirmeli. Pas kalitesi artmalı.",
                    date: new Date('2026-01-30')
                }
            ]
        });

        // 7. ACADEMY COUNTS UPDATE (Sayıları senkronize et)
        await this.academyModel.findByIdAndUpdate(academyMertcan._id, {
            playerCount: 2,
            coachCount: 1,
            parentCount: 1
        });
        await this.academyModel.findByIdAndUpdate(academyAtilla._id, {
            playerCount: 2,
            coachCount: 1,
            parentCount: 1
        });
        await this.academyModel.findByIdAndUpdate(academyHamburg._id, {
            playerCount: 1,
            coachCount: 1,
            parentCount: 1
        });
        await this.academyModel.findByIdAndUpdate(academyMurat._id, {
            playerCount: 0,
            coachCount: 0,
            parentCount: 0
        });

        console.log('✅ SEED TAMAMLANDI!');
        console.log('🔑 Şifre: 123456 (Tüm kullanıcılar için)');

        return { message: 'Seed data created' };
    }
}
