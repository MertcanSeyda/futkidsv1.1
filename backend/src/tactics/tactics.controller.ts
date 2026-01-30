import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TacticsService } from './tactics.service';
import { CreateTacticDto } from './dto/create-tactic.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { AiService } from './ai.service';

@Controller('tactics')
@UseGuards(JwtAuthGuard)
export class TacticsController {
    constructor(
        private readonly tacticsService: TacticsService,
        private readonly aiService: AiService
    ) { }

    @Post()
    create(@Body() createTacticDto: CreateTacticDto, @Request() req) {
        return this.tacticsService.create(createTacticDto, req.user.userId);
    }

    @Post('ai-generate')
    async generateAiTactic(@Body('prompt') prompt: string) {
        try {
            const frames = await this.aiService.generateTacticFrames(prompt);
            return { frames };
        } catch (error) {
            console.error('AI Controller Error:', error);
            return {
                error: true,
                message: error.message,
                details: error.response?.data || error.toString()
            };
        }
    }

    @Get()
    findAll(@Query('academy') academy: string) {
        return this.tacticsService.findAll(academy);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tacticsService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tacticsService.remove(id);
    }
}
