import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Tile } from '@app/model/schema/tile.schema';
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';

describe('GameValidationService', () => {
    let gameValidationService: GameValidationService;
    let gameService: GameService;

    beforeEach(() => {
        gameService = new GameService(null); // Mock your GameService here if needed
        gameValidationService = new GameValidationService(gameService);
    });

    describe('validateGame', () => {
        it('should return valid for a valid game', async () => {
            const game: Game = {
                name: 'Valid Game',
                description: 'A valid description',
                mode: GameMode.CTF,
                imageUrl: 'https://example.com/image.jpg',
                size: 10,
                isVisible: true,
                tiles: createValidTiles(10),
            };

            jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null); // No existing game with the same name
            const result = await gameValidationService.validateGame(game);
            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
        });

        it('should return invalid if name is empty', async () => {
            const game: UpdateGameDto = {
                name: '',
                description: 'A valid description',
                tiles: createValidTiles(10),
            };

            jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
            const result = await gameValidationService.validateGame(game);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Le nom du jeu doit être unique et la description est obligatoire.');
        });

        it('should return invalid if description is empty', async () => {
            const game: UpdateGameDto = {
                name: 'Game with empty description',
                description: '',
                tiles: createValidTiles(10),
            };

            jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
            const result = await gameValidationService.validateGame(game);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Le nom du jeu doit être unique et la description est obligatoire.');
        });

        it('should return true if terrain tiles count is more than half of the total tiles for small size', async () => {
            const game: Game = {
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
                        { type: TileType.Grass },
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

            const result = await gameValidationService.isMapTilesValid(game, MapSize.SMALL);
            expect(result).toBe(true);
        });

        it('should return false if terrain tiles count is not more than half of the total tiles for small size', async () => {
            const game: Game = {
                tiles: [
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

            const result = await gameValidationService.isMapTilesValid(game, MapSize.SMALL);
            expect(result).toBe(false);
        });

        it('should return false if the numbre of tiles is exactly half of the total tiles for small size', async () => {
            const game: Game = {
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

            const result = await gameValidationService.isMapTilesValid(game, MapSize.SMALL);
            expect(result).toBe(false);
        });

        test('should return invalid if door placement is invalid', async () => {
            const game = {
                tiles: [
                    [{ type: TileType.Wall }, { type: TileType.Grass }, { type: TileType.Wall }],
                    [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Grass }], // Invalid placement
                    [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Wall }],
                ],
                name: 'Test Game',
                description: 'A game description.',
            } as UpdateGameDto;

            jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
            const result = await gameValidationService.validateGame(game);

            expect(result.isValid).toBe(false);

            expect(result.errors).toContain(
                'La porte doit être placée entre des tuiles de murs sur un même axe et avoir des tuiles de type terrain sur l’autre axe.',
            );
        });
    });

    function createValidTiles(size: number): Tile[][] {
        const tiles: Tile[][] = [];
        for (let i = 0; i < size; i++) {
            tiles[i] = [];
            for (let j = 0; j < size; j++) {
                tiles[i][j] = { type: TileType.Grass }; // All tiles are grass for a valid map
            }
        }
        // Place a door surrounded by walls and terrains
        tiles[1][1] = { type: TileType.Door };
        tiles[1][0] = { type: TileType.Wall };
        tiles[1][2] = { type: TileType.Wall };
        tiles[0][1] = { type: TileType.Grass };
        tiles[2][1] = { type: TileType.Grass };
        return tiles;
    }
});
