import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new student (player data only)' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all students' })
  @ApiQuery({ name: 'academy', required: false })
  @ApiQuery({ name: 'parent', required: false })
  findAll(@Query('academy') academy?: string, @Query('parent') parent?: string) {
    return this.studentsService.findAll(academy, parent);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student' })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
