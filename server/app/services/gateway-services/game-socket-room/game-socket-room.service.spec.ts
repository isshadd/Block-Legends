import { Test, TestingModule } from '@nestjs/testing';
import { GameSocketRoomService } from './game-socket-room.service';

describe('GameSocketRoomService', () => {
    let service: GameSocketRoomService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameSocketRoomService],
        }).compile();

        service = module.get<GameSocketRoomService>(GameSocketRoomService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
