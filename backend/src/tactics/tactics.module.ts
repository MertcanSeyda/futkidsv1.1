import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TacticsService } from './tactics.service';
import { TacticsController } from './tactics.controller';
import { SeedTacticsController } from './seed-tactics.controller';
import { Tactic, TacticSchema } from './schemas/tactic.schema';

import { AiService } from './ai.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: Tactic.name, schema: TacticSchema }])],
    controllers: [TacticsController, SeedTacticsController],
    providers: [TacticsService, AiService],
    exports: [TacticsService, AiService],
})
export class TacticsModule { }
