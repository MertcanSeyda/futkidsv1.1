import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SeedService } from './seed/seed.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seedService: SeedService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('seed')
  async seed() {
    return await this.seedService.forceSeed();
  }
}
