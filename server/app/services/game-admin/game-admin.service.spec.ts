import { Game, GameDocument } from '@app/model/database/game';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { GameAdminService } from './game-admin.service';

describe('GameAdminService', () => {
    let service: GameAdminService;
    let gameModel: Model<GameDocument>;

    beforeEach(async () => {
        gameModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<GameDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameAdminService,
                Logger,
                {
                    provide: getModelToken(Game.name),
                    useValue: gameModel,
                },
            ],
        }).compile();

        service = module.get<GameAdminService>(GameAdminService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
