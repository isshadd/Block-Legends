import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from '@app/services/game/game.service';
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Game } from '@app/model/database/game';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';

describe('GameController', () => {
    let controller: GameController;
    let gameService: GameService;
    let gameValidationService: GameValidationService;
    let mockResponse: Partial<Response>;
    let createGameDto: CreateGameDto;
    let updateGameDto: UpdateGameDto;
    let mockGame: Game;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: {
                        getAllGames: jest.fn(),
                        getGame: jest.fn(),
                        addGame: jest.fn(),
                        modifyGame: jest.fn(),
                        deleteGame: jest.fn(),
                        emptyDB: jest.fn(),
                    },
                },
                {
                    provide: GameValidationService,
                    useValue: {
                        validateGame: jest.fn(),
                        isHalfMapTilesValid: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
        gameService = module.get<GameService>(GameService);
        gameValidationService = module.get<GameValidationService>(GameValidationService);

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        createGameDto = {
            name: 'New Game',
            description: 'new game description',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            isVisible: true,
            imageUrl: 'test.jpg',
            tiles: [],
        };

        updateGameDto = {
            description: 'Updated description',
        };

        mockGame = {
            _id: '1',
            name: 'Existing Game',
            description: 'game description',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            isVisible: true,
            imageUrl: 'test.jpg',
            tiles: [],
        };
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('allGames', () => {
        it('should return all games', async () => {
            jest.spyOn(gameService, 'getAllGames').mockResolvedValue([mockGame]);
            await controller.allGames(mockResponse as Response);
            expect(gameService.getAllGames).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith([mockGame]);
        });

        it('should handle errors when fetching all games', async () => {
            jest.spyOn(gameService, 'getAllGames').mockRejectedValue(new Error('Error fetching games'));
            await controller.allGames(mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockResponse.send).toHaveBeenCalledWith('Error fetching games');
        });
    });

    describe('findMap', () => {
        it('should return a game by id', async () => {
            jest.spyOn(gameService, 'getGame').mockResolvedValue(mockGame);
            await controller.findMap('1', mockResponse as Response);
            expect(gameService.getGame).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.json).toHaveBeenCalledWith(mockGame);
        });

        it('should handle errors when fetching a game by id', async () => {
            jest.spyOn(gameService, 'getGame').mockRejectedValue(new Error('Game not found'));
            await controller.findMap('1', mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockResponse.send).toHaveBeenCalledWith('Game not found');
        });
    });

    describe('create', () => {
        it('should create a new game', async () => {
            jest.spyOn(gameValidationService, 'validateGame').mockResolvedValue({ isValid: true, errors: [] });
            jest.spyOn(gameValidationService, 'isHalfMapTilesValid').mockResolvedValue(true);
            jest.spyOn(gameService, 'addGame').mockResolvedValue(mockGame);
            await controller.create(createGameDto, mockResponse as Response);
            expect(gameValidationService.validateGame).toHaveBeenCalledWith(createGameDto);
            expect(gameValidationService.isHalfMapTilesValid).toHaveBeenCalledWith(createGameDto, createGameDto.size);
            expect(gameService.addGame).toHaveBeenCalledWith(createGameDto);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
            expect(mockResponse.json).toHaveBeenCalledWith(mockGame);
        });

        it('should handle validation errors when creating a game', async () => {
            jest.spyOn(gameValidationService, 'validateGame').mockResolvedValue({ isValid: false, errors: ['Validation error'] });
            await controller.create(createGameDto, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['Validation error'] });
        });

        it('should handle tile validation errors when creating a game', async () => {
            jest.spyOn(gameValidationService, 'validateGame').mockResolvedValue({ isValid: true, errors: [] });
            jest.spyOn(gameValidationService, 'isHalfMapTilesValid').mockResolvedValue(false);
            await controller.create(createGameDto, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith({
                errors: ['Plus de 50 % de la carte doit être composée de tuiles de type Grass, Water ou Ice.'],
            });
        });

        it('should handle errors when creating a game', async () => {
            jest.spyOn(gameService, 'addGame').mockRejectedValue(new Error('Create failed'));
            await controller.create(createGameDto, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockResponse.send).toHaveBeenCalledWith('Create failed');
        });
    });

    describe('patchGame', () => {
        it('should update a game', async () => {
            jest.spyOn(gameService, 'getGame').mockResolvedValue(mockGame);
            jest.spyOn(gameValidationService, 'isHalfMapTilesValid').mockResolvedValue(true);
            jest.spyOn(gameValidationService, 'validateGame').mockResolvedValue({ isValid: true, errors: [] });
            await controller.patchGame('1', updateGameDto, mockResponse as Response);
            expect(gameService.getGame).toHaveBeenCalledWith('1');
            expect(gameValidationService.isHalfMapTilesValid).toHaveBeenCalledWith(expect.any(Object), mockGame.size);
            expect(gameService.modifyGame).toHaveBeenCalledWith('1', updateGameDto);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should handle validation errors when updating a game', async () => {
            jest.spyOn(gameService, 'getGame').mockResolvedValue(mockGame);
            jest.spyOn(gameValidationService, 'isHalfMapTilesValid').mockResolvedValue(true);
            jest.spyOn(gameValidationService, 'validateGame').mockResolvedValue({ isValid: false, errors: ['Validation error'] });
            await controller.patchGame('1', updateGameDto, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledWith('Validation error');
        });

        it('should handle errors when updating a game', async () => {
            jest.spyOn(gameService, 'modifyGame').mockRejectedValue(new Error('Update failed'));
            await controller.patchGame('1', updateGameDto, mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockResponse.send).toHaveBeenCalledWith('Update failed');
        });
    });

    describe('deleteGame', () => {
        it('should delete a game', async () => {
            await controller.deleteGame('1', mockResponse as Response);
            expect(gameService.deleteGame).toHaveBeenCalledWith('1');
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should handle errors when deleting a game', async () => {
            jest.spyOn(gameService, 'deleteGame').mockRejectedValue(new Error('Delete failed'));
            await controller.deleteGame('1', mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockResponse.send).toHaveBeenCalledWith('Delete failed');
        });
    });

    describe('emptyDatabase', () => {
        it('should empty the database', async () => {
            await controller.emptyDatabase(mockResponse as Response);
            expect(gameService.emptyDB).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
            expect(mockResponse.send).toHaveBeenCalled();
        });

        it('should handle errors when emptying the database', async () => {
            jest.spyOn(gameService, 'emptyDB').mockRejectedValue(new Error('Empty failed'));
            await controller.emptyDatabase(mockResponse as Response);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
            expect(mockResponse.send).toHaveBeenCalledWith('Empty failed');
        });
    });
});
