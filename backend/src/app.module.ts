import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AcademiesModule } from './academies/academies.module';
import { SeedModule } from './seed/seed.module';
import { MatchesModule } from './matches/matches.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { StudentsModule } from './students/students.module';
import { MailModule } from './mail/mail.module';
import { TacticsModule } from './tactics/tactics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(4000),
        GEMINI_API_KEY: Joi.string().optional(),
        OPENAI_API_KEY: Joi.string().optional(),
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    AcademiesModule,
    SeedModule,
    MatchesModule,
    NutritionModule,
    StudentsModule,
    MailModule,
    TacticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
