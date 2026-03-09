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

  // --- Coach Comments ---
  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a coach comment to a student' })
  addComment(
    @Param('id') id: string,
    @Body() body: { coachId: string; comment: string },
  ) {
    return this.studentsService.addComment(id, body.coachId, body.comment);
  }

  @Put(':id/comments/:commentId')
  @ApiOperation({ summary: 'Update a coach comment' })
  updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body() body: { comment: string },
  ) {
    return this.studentsService.updateComment(id, commentId, body.comment);
  }

  @Delete(':id/comments/:commentId')
  @ApiOperation({ summary: 'Delete a coach comment' })
  deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
  ) {
    return this.studentsService.deleteComment(id, commentId);
  }

  // --- Playstyles ---
  @Post(':id/playstyles')
  @ApiOperation({ summary: 'Add a playstyle to a student' })
  addPlaystyle(
    @Param('id') id: string,
    @Body() body: { title: string; description: string },
  ) {
    return this.studentsService.addPlaystyle(id, body.title, body.description);
  }

  @Put(':id/playstyles/:playstyleId')
  @ApiOperation({ summary: 'Update a playstyle' })
  updatePlaystyle(
    @Param('id') id: string,
    @Param('playstyleId') playstyleId: string,
    @Body() body: { title?: string; description?: string; active?: boolean },
  ) {
    return this.studentsService.updatePlaystyle(id, playstyleId, body);
  }

  @Delete(':id/playstyles/:playstyleId')
  @ApiOperation({ summary: 'Remove a playstyle from a student' })
  deletePlaystyle(
    @Param('id') id: string,
    @Param('playstyleId') playstyleId: string,
  ) {
    return this.studentsService.deletePlaystyle(id, playstyleId);
  }

  // --- AI Report ---
  @Post(':id/ai-report')
  @ApiOperation({ summary: 'Generate AI Scout Report for a student via Gemini API' })
  generateAiReport(@Param('id') id: string) {
    return this.studentsService.generateAiReport(id);
  }
}
