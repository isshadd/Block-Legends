import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;
    let gameValidationService: GameValidationService;
    let mockGameModel: any;

    const mockValidationService = {
        validateGame: jest.fn(),
        validateGameName: jest.fn(),
        validateUpdatedGameName: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        mockGameModel = {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            deleteMany: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                { provide: getModelToken(Game.name), useValue: mockGameModel },
                { provide: GameValidationService, useValue: mockValidationService },
            ],
        }).compile();

        gameService = module.get<GameService>(GameService);
        gameValidationService = module.get<GameValidationService>(GameValidationService);
    });

    it('should be defined', () => {
        expect(gameService).toBeDefined();
    });

    // Test pour `getAllGames`
    it('should return all games', async () => {
        const mockGames = [{ name: 'Game1' }, { name: 'Game2' }];
        mockGameModel.find.mockResolvedValue(mockGames);

        const result = await gameService.getAllGames();
        expect(result).toEqual(mockGames);
        expect(mockGameModel.find).toHaveBeenCalledWith({});
    });

    // Test pour `getGame`
    it('should return a game by id', async () => {
        const mockGame = { name: 'Game1' };
        mockGameModel.findOne.mockResolvedValue(mockGame);

        const result = await gameService.getGame('123');
        expect(result).toEqual(mockGame);
        expect(mockGameModel.findOne).toHaveBeenCalledWith({ _id: '123' });
    });

    // Test pour `addGame`
    it('should throw an error when validation fails during adding a game', async () => {
        const createDto: CreateGameDto = {
            name: 'Test Game',
            description: 'A test game description',
            size: MapSize.SMALL,
            mode: GameMode.CTF,
            imageUrl: 'https://example.com/image.jpg',
            isVisible: true,
            tiles: [],
        };
        mockValidationService.validateGame.mockResolvedValue({ isValid: false, errors: ['Error'] });

        await expect(gameService.addGame(createDto)).rejects.toThrow(
            'Veuillez corriger les erreurs suivantes avant de pouvoir continuer: Le nom du jeu doit être unique.<br>Error',
        );
    });

    // Test pour `modifyGame`
    it('should throw an error when validation fails during update', async () => {
        const updateDto: UpdateGameDto = { name: 'Updated Game' };
        mockValidationService.validateGame.mockResolvedValue({ isValid: false, errors: ['Validation error'] });

        await expect(gameService.modifyGame('123', updateDto)).rejects.toThrow(
            'Veuillez corriger les erreurs suivantes avant de pouvoir continuer: Le nom du jeu doit être unique.<br>Validation error',
        );
    });

    // Test pour `deleteGame`
    it('should throw an error if no game is found during deletion', async () => {
        mockGameModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

        await expect(gameService.deleteGame('123')).rejects.toThrow('Could not find game');
    });

    // Test pour `emptyDB`
    it('should empty the database successfully', async () => {
        mockGameModel.deleteMany.mockResolvedValue({ deletedCount: 1 });

        await gameService.emptyDB();
        expect(mockGameModel.deleteMany).toHaveBeenCalledWith({});
    });
});
