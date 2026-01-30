import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user (player, coach, parent)' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiQuery({ name: 'role', required: false })
    @ApiQuery({ name: 'academy', required: false })
    @ApiQuery({ name: 'parent', required: false })
    findAll(@Query('role') role?: string, @Query('academy') academy?: string, @Query('parent') parent?: string) {
        return this.usersService.findAll(role, academy, parent);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete user' })
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }

    @Get('academy/:academyId/players')
    @ApiOperation({ summary: 'Get all players in an academy' })
    getAcademyPlayers(@Param('academyId') academyId: string) {
        return this.usersService.findAll('player', academyId);
    }

    @Get('academy/:academyId/coaches')
    @ApiOperation({ summary: 'Get all coaches in an academy' })
    getAcademyCoaches(@Param('academyId') academyId: string) {
        return this.usersService.findAll('coach', academyId);
    }
}
