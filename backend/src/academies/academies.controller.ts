import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AcademiesService } from './academies.service';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { UpdateAcademyDto } from './dto/update-academy.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('academies')
@Controller('academies')
export class AcademiesController {
    constructor(private readonly academiesService: AcademiesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new academy' })
    create(@Body() createAcademyDto: CreateAcademyDto) {
        return this.academiesService.create(createAcademyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all academies' })
    findAll() {
        return this.academiesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get academy by ID' })
    findOne(@Param('id') id: string) {
        return this.academiesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update academy' })
    update(@Param('id') id: string, @Body() updateAcademyDto: UpdateAcademyDto) {
        return this.academiesService.update(id, updateAcademyDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete academy' })
    remove(@Param('id') id: string) {
        return this.academiesService.remove(id);
    }
}
