import { Test, TestingModule } from '@nestjs/testing';
import { GameAdminController } from './game-admin.controller';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import { GameAdminService } from '@app/services/game-admin/game-admin.service';

describe('GameAdminController', () => {
    let controller: GameAdminController;
    let gameAdminService: SinonStubbedInstance<GameAdminService>;

    beforeEach(async () => {
        gameAdminService = createStubInstance(GameAdminService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameAdminController],
            providers: [
                {
                    provide: GameAdminService,
                    useValue: gameAdminService,
                },
            ],
        }).compile();

        controller = module.get<GameAdminController>(GameAdminController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
