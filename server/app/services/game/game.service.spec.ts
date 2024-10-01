import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let model: Model<GameDocument>;
    let games: Game[];
    let createGameDto: CreateGameDto;
    let updateGameDto: UpdateGameDto;

    const mockGameModel = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
        deleteMany: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                {
                    provide: getModelToken(Game.name),
                    useValue: mockGameModel,
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
        model = module.get<Model<GameDocument>>(getModelToken(Game.name));

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
        expect(service).toBeDefined();
    });

    it('should retrieve all games', async () => {
        mockGameModel.find.mockResolvedValue(games);

        const result = await service.getAllGames();
        expect(model.find).toHaveBeenCalled();
        expect(result).toEqual(games);
    });

    it('should retrieve a single game by id', async () => {
        mockGameModel.findOne.mockResolvedValue(games[0]);

        const result = await service.getGame('someGameId');
        expect(model.findOne).toHaveBeenCalledWith({ _id: 'someGameId' });
        expect(result).toEqual(games[0]);
    });

    it('should add a new game', async () => {
        const mockGame = { ...createGameDto, _id: 'newGameId' };
        mockGameModel.create.mockResolvedValue(mockGame);

        const result = await service.addGame(createGameDto);
        expect(model.create).toHaveBeenCalledWith(createGameDto);
        expect(result).toEqual(mockGame);
    });

    it('should throw an error when adding a new game fails', async () => {
        mockGameModel.create.mockRejectedValue(new Error('Insert failed'));

        await expect(service.addGame(createGameDto)).rejects.toThrow('Failed to insert game: Error: Insert failed');
    });

    it('should update an existing game', async () => {
        mockGameModel.updateOne.mockResolvedValue({ matchedCount: 1 });

        await service.modifyGame('someGameId', updateGameDto);
        expect(model.updateOne).toHaveBeenCalledWith({ _id: 'someGameId' }, updateGameDto);
    });

    it('should throw an error when updating a non-existent game', async () => {
        mockGameModel.updateOne.mockResolvedValue({ matchedCount: 0 });

        await expect(service.modifyGame('someGameId', updateGameDto)).rejects.toThrow('Could not find game');
    });

    it('should delete a game by id', async () => {
        mockGameModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

        await service.deleteGame('someGameId');
        expect(model.deleteOne).toHaveBeenCalledWith({ _id: 'someGameId' });
    });

    it('should throw an error when trying to delete a non-existent game', async () => {
        mockGameModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

        await expect(service.deleteGame('someGameId')).rejects.toThrow('Could not find game');
    });

    it('should empty the database', async () => {
        mockGameModel.deleteMany.mockResolvedValue({ deletedCount: 10 });

        await service.emptyDB();
        expect(model.deleteMany).toHaveBeenCalledWith({});
    });

    it('should throw an error when emptying the database fails', async () => {
        mockGameModel.deleteMany.mockRejectedValue(new Error('Delete failed'));

        await expect(service.emptyDB()).rejects.toThrow('Failed to delete games: Error: Delete failed');
    });
});
