import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Tile } from '@app/model/schema/tile.schema';
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@common/enums/game-mode';
import { ItemType } from '@common/enums/item-type';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';

describe('GameValidationService', () => {
    let gameValidationService: GameValidationService;
    let gameService: GameService;
    let game: Game;

    beforeEach(() => {
        gameService = {
            getGameByName: jest.fn(),
        } as unknown as GameService; // Mock your GameService here if needed
        gameValidationService = new GameValidationService(gameService);

        game = {
            tiles: [
                [
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Water },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                ],
                [
                    { type: TileType.Ice },
                    { type: TileType.Grass },
                    { type: TileType.Water },
                    { type: TileType.Water },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                ],
                [
                    { type: TileType.Ice },
                    { type: TileType.Grass },
                    { type: TileType.Water },
                    { type: TileType.Water },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                ],
                [
                    { type: TileType.Ice },
                    { type: TileType.Grass },
                    { type: TileType.Water },
                    { type: TileType.Water },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                ],
                [
                    { type: TileType.Ice },
                    { type: TileType.Grass },
                    { type: TileType.Water },
                    { type: TileType.Water },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                    { type: TileType.Grass },
                ],
                [
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                ],
                [
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                ],
                [
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                ],
                [
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                ],
                [
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                    { type: TileType.Wall },
                ],
            ],
            name: 'Test Game',
            description: 'A game description.',
            size: MapSize.SMALL, // This indicates a 10x10 grid
            mode: GameMode.CTF, // Adjust according to your game mode
            imageUrl: 'http://example.com/image.png',
            isVisible: true,
        } as Game;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return invalid if name is empty', async () => {
        game.name = '';
        const result = await gameValidationService.validateName(game);
        expect(result).toBe(false);
    });

    it('should return invalid if description is empty', async () => {
        game.description = '';
        const result = await gameValidationService.validateGame(game);
        expect(result.isValid).toBe(false);
    });

    it('should return true if terrain tiles count is more than half of the total tiles for small size', async () => {
        game.tiles[5][0] = { type: TileType.Water };
        const result = await gameValidationService.isHalfMapTilesValid(game);
        expect(result).toBe(true);
    });

    it('should return false if terrain tiles count is not more than half of the total tiles for small size', async () => {
        game.tiles[4][0] = { type: TileType.Wall };
        const result = await gameValidationService.isHalfMapTilesValid(game);
        expect(result).toBe(false);
    });

    it('should return false if the numbre of tiles is exactly half of the total tiles for small size', async () => {
        const result = await gameValidationService.isHalfMapTilesValid(game);
        expect(result).toBe(false);
    });

    test('should return invalid if door placement is invalid if not horizontal or vertical', async () => {
        const gameDoor = {
            tiles: [
                [{ type: TileType.Wall }, { type: TileType.Grass }, { type: TileType.Wall }],
                [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Grass }], // Invalid placement
                [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Wall }],
            ],
            name: 'Test Game',
            description: 'A game description.',
        } as UpdateGameDto;

        jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        const result = await gameValidationService.validateGame(gameDoor);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'La porte doit être placée entre des tuiles de murs sur un même axe et avoir des tuiles de type terrain sur l’autre axe.',
        );
    });

    test('should return invalid if door placement is invalid if horizontal and vertical walls', async () => {
        const gameDoor = {
            tiles: [
                [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Wall }],
                [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Wall }], // Invalid placement
                [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Wall }],
            ],
            name: 'Test Game',
            description: 'A game description.',
        } as UpdateGameDto;

        jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        const result = await gameValidationService.validateGame(gameDoor);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'La porte doit être placée entre des tuiles de murs sur un même axe et avoir des tuiles de type terrain sur l’autre axe.',
        );
    });

    test('should return invalid if door placement is invalid if no walls', async () => {
        const gameDoor = {
            tiles: [
                [{ type: TileType.Wall }, { type: TileType.Grass }, { type: TileType.Wall }],
                [{ type: TileType.Grass }, { type: TileType.Door }, { type: TileType.Grass }], // Invalid placement
                [{ type: TileType.Wall }, { type: TileType.Grass }, { type: TileType.Wall }],
            ],
            name: 'Test Game',
            description: 'A game description.',
        } as UpdateGameDto;

        jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        const result = await gameValidationService.validateGame(gameDoor);

        expect(result.isValid).toBe(false);

        expect(result.errors).toContain(
            'La porte doit être placée entre des tuiles de murs sur un même axe et avoir des tuiles de type terrain sur l’autre axe.',
        );
    });

    it('should return the correct number of spawn points', async () => {
        const gameDoor = {
            tiles: [
                [{ type: TileType.Wall, item: { type: ItemType.Spawn } }, { type: TileType.Grass }, { type: TileType.Wall }],
                [{ type: TileType.Grass }, { type: TileType.Door }, { type: TileType.Grass }], // Invalid placement
                [{ type: TileType.Wall }, { type: TileType.Grass }, { type: TileType.Wall }],
            ],
            name: 'Test Game',
            description: 'A game description.',
        } as Game;

        jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        // (gameService.getGameByName as jest.Mock).mockResolvedValue(mockGame);

        const result = await gameValidationService.getNumberOfSpawnPoints(gameDoor);
        expect(result).toBe(1);
    });

    it('should return invalid if the number of start points is not exactly 2 for a small sized map', async () => {
        game.tiles = createTilesWithInvalidSpawn(MapSize.SMALL);
        jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        const result = await gameValidationService.isValidSizeBySpawnPoints(game);
        expect(result).toBe(false);
    });

    it('should return invalid if the number of start points is not exactly 4 for a medium sized map', async () => {
        game.tiles = createTilesWithInvalidSpawn(MapSize.MEDIUM);
        jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        const result = await gameValidationService.isValidSizeBySpawnPoints(game);
        expect(result).toBe(false);
    });

    it('should return invalid if the number of start points is not exactly 6 for a large sized map', async () => {
        game.tiles = createTilesWithInvalidSpawn(MapSize.LARGE);
        jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        const result = await gameValidationService.isValidSizeBySpawnPoints(game);
        expect(result).toBe(false);
    });

    // Test mapToMatrix
    describe('mapToMatrix', () => {
        it('should convert game tiles to a matrix of 1s and 0s', async () => {
            const gameMatrix: Game = {
                name: 'Test Game',
                description: 'Test Description',
                size: MapSize.SMALL,
                tiles: [
                    [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Grass }],
                    [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                ],
            } as Game;

            const result = await gameValidationService.mapToMatrix(gameMatrix);
            expect(result).toEqual([
                [1, 0, 0],
                [0, 1, 0],
            ]);
        });
    });

    // Test mapIsValid
    describe('mapIsValid', () => {
        it('should return false if there are inaccessible tiles', async () => {
            const gameMap: Game = {
                name: 'Test Game',
                description: 'Test Description',
                size: MapSize.SMALL,
                tiles: [
                    [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                    [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Grass }],
                ],
            } as Game;

            const result = await gameValidationService.mapIsValid(gameMap);
            expect(result).toBe(false);
        });

        it('should return true if all tiles are accessible', async () => {
            const gameMap: Game = {
                name: 'Test Game',
                description: 'Test Description',
                size: MapSize.SMALL,
                tiles: [
                    [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                    [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                ],
            } as Game;

            const result = await gameValidationService.mapIsValid(gameMap);
            expect(result).toBe(true);
        });
    });
});

function createTilesWithInvalidSpawn(size: number): Tile[][] {
    const tiles: Tile[][] = [];
    let invalidSpawnCount = 0;
    const SPAWN_SMALL = 2;
    const SPAWN_MEDIUM = 4;
    const SPAWN_LARGE_INVALID = 7;
    switch (size) {
        case MapSize.SMALL:
            invalidSpawnCount = SPAWN_MEDIUM;
        case MapSize.MEDIUM:
            invalidSpawnCount = SPAWN_SMALL;
        case MapSize.LARGE:
            invalidSpawnCount = SPAWN_LARGE_INVALID;
        default:
            invalidSpawnCount = 0;
    }
    for (let i = 0; i < size; i++) {
        tiles[i] = [];
        for (let j = 0; j < size; j++) {
            tiles[i][j] = { type: TileType.Grass };
            if (invalidSpawnCount > 0) {
                tiles[i][j].item.type = ItemType.Spawn;
                invalidSpawnCount--;
            }
        }
    }
    return tiles;
}
