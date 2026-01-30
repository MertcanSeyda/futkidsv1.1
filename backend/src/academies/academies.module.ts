import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Academy, AcademySchema } from './schemas/academy.schema';
import { AcademiesController } from './academies.controller';
import { AcademiesService } from './academies.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Academy.name, schema: AcademySchema }])],
    controllers: [AcademiesController],
    providers: [AcademiesService],
    exports: [AcademiesService],
})
export class AcademiesModule { }
