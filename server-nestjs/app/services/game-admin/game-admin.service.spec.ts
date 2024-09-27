import { Test, TestingModule } from '@nestjs/testing';
import { GameAdminService } from './game-admin.service';

describe('GameAdminService', () => {
    let service: GameAdminService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameAdminService],
        }).compile();

        service = module.get<GameAdminService>(GameAdminService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
