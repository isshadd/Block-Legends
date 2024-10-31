import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto'; // Ensure correct import path
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto'; // Ensure correct import path
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';

describe('GameService', () => {
    let gameService: GameService;
    // eslint-disable-next-line no-unused-vars
    let gameValidationService: GameValidationService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockGameModel: any;

    const createDto: CreateGameDto = {
        name: 'Test Game',
        description: 'A test game description',
        size: MapSize.SMALL, // Adjust according to your enum or valid value
        mode: GameMode.CTF,
        imageUrl: 'https://example.com/image.jpg',
        isVisible: true,
        tiles: [],
    };

    const mockValidationService = {
        validateGame: jest.fn(),
        getGameByName: jest.fn().mockResolvedValue(null), // Mock method if needed
    };

    beforeEach(async () => {
        jest.clearAllMocks(); // Clear mocks before each test
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
                {
                    provide: getModelToken(Game.name),
                    useValue: mockGameModel,
                },
                {
                    provide: GameValidationService,
                    useValue: mockValidationService,
                },
            ],
        }).compile();

        gameService = module.get<GameService>(GameService);
        gameValidationService = module.get<GameValidationService>(GameValidationService);
    });

    it('should be defined', () => {
        expect(gameService).toBeDefined();
    });
    // Test for getAllGames
    it('should return all games', async () => {
        const mockGames = [{ name: 'Game1' }, { name: 'Game2' }];
        mockGameModel.find.mockResolvedValue(mockGames);

        const result = await gameService.getAllGames();
        expect(result).toEqual(mockGames);
        expect(mockGameModel.find).toHaveBeenCalledWith({});
    });

    // Test for getGame
    it('should return a game by id', async () => {
        const mockGame = { name: 'Game1' };
        mockGameModel.findOne.mockResolvedValue(mockGame);

        const result = await gameService.getGame('123');
        expect(result).toEqual(mockGame);
        expect(mockGameModel.findOne).toHaveBeenCalledWith({ _id: '123' });
    });

    // Test for getGameByName
    it('should return a game by name', async () => {
        const mockGame = { name: 'Game1' };
        mockGameModel.findOne.mockResolvedValue(mockGame);

        const result = await gameService.getGameByName('Game1');
        expect(result).toEqual(mockGame);
        expect(mockGameModel.findOne).toHaveBeenCalledWith({
            name: { $regex: new RegExp('^' + 'Game1'.trim().replace(/\s+/g, ' ') + '$', 'i') },
        });
    });

    it('should throw an error when validation fails during adding a game', async () => {
        const createDtoFail: CreateGameDto = {
            name: 'Test Game',
            description: 'A test game description',
            size: 10,
            mode: GameMode.CTF,
            imageUrl: 'https://example.com/image.jpg',
            isVisible: true,
            tiles: [],
        };

        // Mock the validation service to return an invalid result
        mockValidationService.validateGame.mockResolvedValue({
            isValid: false,
            errors: ['Name is required', 'Description is too short'],
        });

        await expect(gameService.addGame(createDtoFail)).rejects.toThrow(
            'Veuillez corriger les erreurs suivantes avant de pouvoir continuer: Name is required<br>Description is too short',
        );
    });

    // Test for emptyDB (lines 57-60)
    it('should empty the database', async () => {
        await gameService.emptyDB();
        expect(mockGameModel.deleteMany).toHaveBeenCalledWith({});
    });
    // Test for modifyGame
    it('should throw an error when validation fails during update', async () => {
        const updateDto: UpdateGameDto = { name: 'Updated Game' };

        mockValidationService.validateGame.mockResolvedValue({
            isValid: false,
            errors: ['Some validation error'],
        });

        await expect(gameService.modifyGame('123', updateDto)).rejects.toThrow(
            'Veuillez corriger les erreurs suivantes avant de pouvoir continuer: Some validation error',
        );
    });

    it('should throw an error if the game is not found during update', async () => {
        const updateDto: UpdateGameDto = { name: 'Updated Game' };

        // Mock the validation service to return a valid result
        mockValidationService.validateGame.mockResolvedValue({
            isValid: true,
            errors: [],
        });

        // Mock the updateOne to simulate no game found
        mockGameModel.updateOne.mockResolvedValue({ matchedCount: 0 });

        await expect(gameService.modifyGame('123', updateDto)).rejects.toThrow('Could not find game');
    });

    it('should throw an error when the update operation fails', async () => {
        const updateDto: UpdateGameDto = { name: 'Updated Game' };

        // Mock the validation service to return a valid result
        mockValidationService.validateGame.mockResolvedValue({
            isValid: true,
            errors: [],
        });

        // Mock the updateOne to simulate an error during the update
        mockGameModel.updateOne.mockRejectedValue(new Error('Database error'));

        await expect(gameService.modifyGame('123', updateDto)).rejects.toThrow('Failed to update document: Error: Database error');
    });

    // Test for deleteGame
    it('should delete a game by id', async () => {
        mockGameModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

        await gameService.deleteGame('123');
        expect(mockGameModel.deleteOne).toHaveBeenCalledWith({ _id: '123' });
    });

    it('should throw an error if no game is found during deletion', async () => {
        mockGameModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

        await expect(gameService.deleteGame('123')).rejects.toThrow('Could not find game');
    });
    // Test for emptyDB
    it('should empty the database', async () => {
        await gameService.emptyDB();
        expect(mockGameModel.deleteMany).toHaveBeenCalledWith({});
    });

    // Test addGame method
    it('should add a game successfully', async () => {
        const savedGame: Game = { _id: '123', ...createDto } as Game;

        // Mock validation to succeed
        mockValidationService.validateGame.mockResolvedValue({ isValid: true, errors: [] });

        // Mock the create method to resolve successfully
        mockGameModel.create.mockResolvedValue(savedGame);

        const result = await gameService.addGame(createDto);
        expect(result).toEqual(savedGame);
        expect(mockValidationService.validateGame).toHaveBeenCalled();
        expect(mockGameModel.create).toHaveBeenCalledWith(createDto); // Ensure create was called with the right arguments
    });

    it('should throw an error when the database fails to add a game', async () => {
        // mockValidationService.validateGame.mockResolvedValue({ isValid: true, errors: [] }); // Mock validation success
        mockGameModel.create.mockRejectedValue(new Error('Database error')); // Simulate database error

        await expect(gameService.addGame(createDto)).rejects.toThrow('Failed to insert game: Error: Database error');
    });

    it('should update a game successfully', async () => {
        const updateDto: UpdateGameDto = { name: 'Updated Game' };
        const existingGame: Game = {
            _id: '123',
            name: 'Test Game',
            description: 'A test game description',
            mode: GameMode.CTF,
            isVisible: true,
            imageUrl: 'https://example.com/image.jpg',
            size: MapSize.SMALL,
            tiles: [],
        };

        mockGameModel.findOne.mockResolvedValue(existingGame); // Mock existing game
        mockGameModel.updateOne.mockResolvedValue({ matchedCount: 1 }); // Mock successful update

        await gameService.modifyGame('123', updateDto);
        expect(mockGameModel.updateOne).toHaveBeenCalledWith({ _id: '123' }, updateDto);
    });

    it('should throw an error when validation fails during update', async () => {
        const updateDto: UpdateGameDto = { name: 'Updated Game' };
        mockValidationService.validateGame.mockResolvedValue({
            isValid: false,
            errors: ['Some validation error'],
        });

        await expect(gameService.modifyGame('123', updateDto)).rejects.toThrow(
            'Veuillez corriger les erreurs suivantes avant de pouvoir continuer: Some validation error',
        );
    });

    it('should throw an error when validation fails during update', async () => {
        const updateDto: UpdateGameDto = { name: 'Updated Game' };
        mockValidationService.validateGame.mockResolvedValue({
            isValid: false,
            errors: ['Some validation error'],
        });

        await expect(gameService.modifyGame('123', updateDto)).rejects.toThrow(
            'Veuillez corriger les erreurs suivantes avant de pouvoir continuer: Some validation error',
        );
    });

    // Test deleteGame method
    it('should delete a game successfully', async () => {
        const gameId = '123';
        mockGameModel.deleteOne.mockResolvedValue({ deletedCount: 1 }); // Mock successful deletion

        await gameService.deleteGame(gameId);
        expect(mockGameModel.deleteOne).toHaveBeenCalledWith({ _id: gameId });
    });

    it('should throw an error if the game is not found during deletion', async () => {
        const gameId = '123';
        mockGameModel.deleteOne.mockResolvedValue({ deletedCount: 0 }); // Mock no deletion

        await expect(gameService.deleteGame(gameId)).rejects.toThrow('Could not find game');
    });

    // Test emptyDB method
    it('should empty the database successfully', async () => {
        mockGameModel.deleteMany.mockResolvedValue({ deletedCount: 1 }); // Mock successful deletion

        await gameService.emptyDB();
        expect(mockGameModel.deleteMany).toHaveBeenCalledWith({});
    });

    it('should throw an error if deletion fails', async () => {
        mockGameModel.deleteMany.mockRejectedValue(new Error('Delete failed')); // Simulate error

        await expect(gameService.emptyDB()).rejects.toThrow('Failed to delete games: Error: Delete failed');
    });
});
