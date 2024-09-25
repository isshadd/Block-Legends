import { CourseController } from '@app/controllers/course/course.controller';
import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Course, courseSchema } from '@app/model/database/course';
import { CourseService } from '@app/services/course/course.service';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MapController } from './controllers/map/map.controller';
import { Map, MapSchema } from './model/database/map';
import { MapService } from './services/map/map.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
        MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }]),
    ],
    controllers: [CourseController, DateController, ExampleController, MapController],
    providers: [ChatGateway, CourseService, DateService, ExampleService, Logger, MapService],
})
export class AppModule {}
