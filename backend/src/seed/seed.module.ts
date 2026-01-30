import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Academy, AcademySchema } from '../academies/schemas/academy.schema';
import { Student, StudentSchema } from '../students/schemas/student.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Academy.name, schema: AcademySchema },
            { name: Student.name, schema: StudentSchema },
        ]),
    ],
    controllers: [SeedController],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule { }
