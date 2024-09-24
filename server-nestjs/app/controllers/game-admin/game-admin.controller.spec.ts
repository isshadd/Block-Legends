import { Test, TestingModule } from '@nestjs/testing';
import { GameAdminController } from './game-admin.controller';

describe('GameAdminController', () => {
  let controller: GameAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameAdminController],
    }).compile();

    controller = module.get<GameAdminController>(GameAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
