import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { GameController } from './game.controller';

describe('GameController', () => {
    let controller: GameController;
    let gameService: GameService;
    let mockResponse: Partial<Response>;
    let games: Game[];
    let createGameDto: CreateGameDto;
    let updateGameDto: UpdateGameDto;

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
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
        gameService = module.get<GameService>(GameService);

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),
        };

        games = [
            {
                _id: '1',
                name: 'Test Game',
                description: 'A test game',
                size: MapSize.SMALL,
                mode: GameMode.Classique,
                isVisible: true,
                imageUrl: 'test.jpg',
                tiles: [],
            },
        ];

        createGameDto = {
            name: 'New Game',
            description: 'new game test',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            isVisible: true,
            imageUrl: 'test.jpg',
            tiles: [],
        };

        updateGameDto = { description: 'Updated description' };
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return all games', async () => {
        jest.spyOn(gameService, 'getAllGames').mockResolvedValue(games);

        await controller.allGames(mockResponse as Response);

        expect(gameService.getAllGames).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(mockResponse.json).toHaveBeenCalledWith(games);
    });

    it('should handle errors when fetching all games', async () => {
        jest.spyOn(gameService, 'getAllGames').mockRejectedValue(new Error('Error occurred'));

        await controller.allGames(mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(mockResponse.send).toHaveBeenCalledWith('Error occurred');
    });

    it('should return a game by id', async () => {
        jest.spyOn(gameService, 'getGame').mockResolvedValue(games[0]);

        await controller.findMap('1', mockResponse as Response);

        expect(gameService.getGame).toHaveBeenCalledWith('1');
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(mockResponse.json).toHaveBeenCalledWith(games[0]);
    });

    it('should handle errors when fetching a game by id', async () => {
        jest.spyOn(gameService, 'getGame').mockRejectedValue(new Error('Game not found'));

        await controller.findMap('1', mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(mockResponse.send).toHaveBeenCalledWith('Game not found');
    });

    it('should create a new game', async () => {
        const newGame: Game = { _id: '2', ...createGameDto };
        jest.spyOn(gameService, 'addGame').mockResolvedValue(newGame);

        await controller.create(createGameDto, mockResponse as Response);

        expect(gameService.addGame).toHaveBeenCalledWith(createGameDto);
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
        expect(mockResponse.json).toHaveBeenCalledWith(newGame);
    });

    it('should handle errors when creating a game', async () => {
        jest.spyOn(gameService, 'addGame').mockRejectedValue(new Error('Create failed'));

        await controller.create(createGameDto, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(mockResponse.send).toHaveBeenCalledWith('Create failed');
    });

    it('should update a game', async () => {
        await controller.patchGame('1', updateGameDto, mockResponse as Response);

        expect(gameService.modifyGame).toHaveBeenCalledWith('1', updateGameDto);
        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
        expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle errors when updating a game', async () => {
        jest.spyOn(gameService, 'modifyGame').mockRejectedValue(new Error('Update failed'));

        await controller.patchGame('1', updateGameDto, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
        expect(mockResponse.send).toHaveBeenCalledWith('Update failed');
    });

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
