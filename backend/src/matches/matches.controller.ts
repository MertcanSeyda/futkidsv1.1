import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('matches')
@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new match' })
    create(@Body() createMatchDto: CreateMatchDto) {
        return this.matchesService.create(createMatchDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get matches (optionally filtered by academy)' })
    @ApiQuery({ name: 'academy', required: false })
    findAll(@Query('academy') academy?: string) {
        return this.matchesService.findAll(academy);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get match by ID' })
    findOne(@Param('id') id: string) {
        return this.matchesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update match' })
    update(@Param('id') id: string, @Body() updateMatchDto: any) {
        return this.matchesService.update(id, updateMatchDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete match' })
    remove(@Param('id') id: string) {
        return this.matchesService.remove(id);
    }
}
