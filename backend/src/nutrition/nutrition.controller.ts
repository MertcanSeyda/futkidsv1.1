import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('nutrition')
@Controller('nutrition')
export class NutritionController {
    constructor(private readonly nutritionService: NutritionService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new nutrition plan' })
    create(@Body() createNutritionPlanDto: CreateNutritionPlanDto) {
        return this.nutritionService.create(createNutritionPlanDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get nutrition plans (optionally filtered by player)' })
    @ApiQuery({ name: 'player', required: false })
    findAll(@Query('player') player?: string) {
        return this.nutritionService.findAll(player);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get nutrition plan by ID' })
    findOne(@Param('id') id: string) {
        return this.nutritionService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update nutrition plan' })
    update(@Param('id') id: string, @Body() updateNutritionDto: any) {
        return this.nutritionService.update(id, updateNutritionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete nutrition plan' })
    remove(@Param('id') id: string) {
        return this.nutritionService.remove(id);
    }
}
