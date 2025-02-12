import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Game, gameSchema } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game/game.controller';
import { GameGateway } from './gateways/gameGateway/game.gateway';
import { PlayGameBoardGateway } from './gateways/playGameBoard/play-game-board.gateway';
import { GameValidationService } from './services/game-validation/game-validation.service';
import { GameSocketRoomService } from './services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameBoardBattleService } from './services/gateway-services/play-game-board-battle-time/play-game-board-battle.service';
import { PlayGameBoardSocketService } from './services/gateway-services/play-game-board-socket/play-game-board-socket.service';
import { PlayGameBoardTimeService } from './services/gateway-services/play-game-board-time/play-game-board-time.service';
import { PlayGameStatisticsService } from './services/gateway-services/play-game-statistics/play-game-statistics.service';

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
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
    ],
    controllers: [GameController],
    providers: [
        ChatGateway,
        Logger,
        GameService,
        GameValidationService,
        GameGateway,
        GameSocketRoomService,
        PlayGameBoardGateway,
        PlayGameBoardSocketService,
        PlayGameBoardTimeService,
        PlayGameBoardBattleService,
        PlayGameStatisticsService,
    ],
})
export class AppModule {}
