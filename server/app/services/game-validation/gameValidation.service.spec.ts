/* eslint-disable max-lines */
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
    const SMALL_SIZE = 10;
    const SMALL_MAP_SPAWN_COUNT = 2;
    const MEDIUM_MAP_SPAWN_COUNT = 4;
    const LARGE_MAP_SPAWN_COUNT = 6;

    beforeEach(() => {
        gameService = {
            getGameByName: jest.fn(),
        } as unknown as GameService; // Mock your GameService here if needed
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
                tiles: createValidTiles(SMALL_SIZE),
            };

            const result = await gameValidationService.validateGame(game);
            expect(result).toBe(true);
        });

        it('should return invalid if name is empty', async () => {
            const game: Game = {
                name: '',
                description: 'A valid description',
                mode: GameMode.CTF,
                imageUrl: 'https://example.com/image.jpg',
                size: 10,
                isVisible: true,
                tiles: createValidTiles(SMALL_SIZE),
            };

            const result = await gameValidationService.validateName(game);
            expect(result).toBe(false);
        });

        it('should return invalid if description is empty', async () => {
            const game: Game = {
                name: 'a Valid Game',
                description: '',
                mode: GameMode.CTF,
                imageUrl: 'https://example.com/image.jpg',
                size: 10,
                isVisible: true,
                tiles: createValidTiles(SMALL_SIZE),
            };

            const result = await gameValidationService.validateGame(game);
            expect(result.isValid).toBe(false);
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

            const result = await gameValidationService.isHalfMapTilesValid(game);
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

            const result = await gameValidationService.isHalfMapTilesValid(game);
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

            const result = await gameValidationService.isHalfMapTilesValid(game);
            expect(result).toBe(false);
        });

        test('should return invalid if door placement is invalid if not horizontal or vertical', async () => {
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

        test('should return invalid if door placement is invalid if horizontal and vertical walls', async () => {
            const game = {
                tiles: [
                    [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Wall }],
                    [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Wall }], // Invalid placement
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

        test('should return invalid if door placement is invalid if no walls', async () => {
            const game = {
                tiles: [
                    [{ type: TileType.Wall }, { type: TileType.Grass }, { type: TileType.Wall }],
                    [{ type: TileType.Grass }, { type: TileType.Door }, { type: TileType.Grass }], // Invalid placement
                    [{ type: TileType.Wall }, { type: TileType.Grass }, { type: TileType.Wall }],
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

        it('should return the correct number of spawn points', async () => {
            const game = {
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

            const result = await gameValidationService.getNumberOfSpawnPoints(game);
            expect(result).toBe(1);
        });

        //     const result = await gameValidationService.getNumberOfSpawnPoints(game);
        //     expect(result).toBe(2);
        // });

        // it('should return invalid if the number of start points is not exactly 2 for a small sized map', async () => {
        //     const game = {
        //         tiles: createTilesWithInvalidSpawn(MapSize.SMALL),
        //         name: 'Test Game',
        //         description: 'A game description.',
        //     } as UpdateGameDto;

        //     jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        //     const result = await gameValidationService.isValidSizeBySpawnPoints(game);

        //     expect(result).toBe(false);
        // });

        // it('should return invalid if the number of start points is not exactly 4 for a medium sized map', async () => {
        //     const game = {
        //         tiles: createTilesWithInvalidSpawn(MapSize.MEDIUM),
        //         name: 'Test Game',
        //         description: 'A game description.',
        //     } as UpdateGameDto;

        //     jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        //     const result = await gameValidationService.isValidSizeBySpawnPoints(game);

        //     expect(result).toBe(false);
        // });

        // it('should return invalid if the number of start points is not exactly 6 for a large sized map', async () => {
        //     const game = {
        //         tiles: createTilesWithInvalidSpawn(MapSize.LARGE),
        //         name: 'Test Game',
        //         description: 'A game description.',
        //     } as UpdateGameDto;

        //     jest.spyOn(gameService, 'getGameByName').mockResolvedValue(null);
        //     const result = await gameValidationService.isValidSizeBySpawnPoints(game);

        //     expect(result).toBe(false);
        // });

        it('should map tiles to a matrix correctly', async () => {
            const mockGame = {
                tiles: [
                    [{ type: TileType.Wall }, { type: TileType.Grass }],
                    [{ type: TileType.Door }, { type: TileType.Water }],
                    [{ type: TileType.Ice }, { type: TileType.Wall }],
                ],
            };
            (gameService.getGameByName as jest.Mock).mockResolvedValue(mockGame);

            const result = await gameValidationService.mapToMatrix(mockGame);
            expect(result).toEqual([
                [1, 0],
                [0, 0],
                [0, 1],
            ]);
        });

        it('should return invalid if a game map is invalid (Unaccessible terrain because of a wall or door)', async () => {
            const game: UpdateGameDto = {
                name: 'Game with invalid walls',
                description: 'example description',
                tiles: [
                    [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                    [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Water }],
                    [{ type: TileType.Ice }, { type: TileType.Ice }, { type: TileType.Ice }],
                ],
            };
            const result = await gameValidationService.mapIsValid(game);
            expect(result).toBe(false);
        });

        it('should return valid if a game map is valid (All terrain is accessible)', async () => {
            const game: UpdateGameDto = {
                name: 'Game with valid walls',
                description: 'example description',
                tiles: [
                    [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                    [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Water }],
                    [{ type: TileType.Ice }, { type: TileType.Ice }, { type: TileType.Ice }],
                ],
            };
            const result = await gameValidationService.mapIsValid(game);
            expect(result).toBe(true);
        });

        describe('GameValidationService', () => {
            beforeEach(() => {
                gameService = {
                    getGameByName: jest.fn(),
                } as unknown as GameService;
                gameValidationService = new GameValidationService(gameService);
            });

            // Test getNumberOfSpawnPoints
            describe('getNumberOfSpawnPoints', () => {
                it('should count the correct number of spawn points', async () => {
                    const game: Game = {
                        name: 'Test Game',
                        description: 'Test Description',
                        size: MapSize.SMALL,
                        tiles: [
                            [{ item: { type: 'Spawn' } }, {}, {}],
                            [{}, { item: { type: 'Spawn' } }, {}],
                            [{}, {}, {}],
                        ],
                    } as Game;

                    const result = await gameValidationService.getNumberOfSpawnPoints(game);
                    expect(result).toBe(2);
                });
            });

            // Test isValidSizeBySpawnPoints
            describe('isValidSizeBySpawnPoints', () => {
                it('should return true if spawn points match map size', async () => {
                    const game: Game = {
                        name: 'Test Game',
                        description: 'Test Description',
                        size: MapSize.SMALL,
                        tiles: [
                            [{ item: { type: 'Spawn' } }, {}, {}],
                            [{}, { item: { type: 'Spawn' } }, {}],
                            [{}, {}, {}],
                        ],
                    } as Game;

                    jest.spyOn(gameService, 'getGameByName').mockResolvedValue(game);
                    const result = await gameValidationService.isValidSizeBySpawnPoints(game);
                    expect(result).toBe(true);
                });
            });

            // Test mapToMatrix
            describe('mapToMatrix', () => {
                it('should convert game tiles to a matrix of 1s and 0s', async () => {
                    const game: Game = {
                        name: 'Test Game',
                        description: 'Test Description',
                        size: MapSize.SMALL,
                        tiles: [
                            [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Grass }],
                            [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                        ],
                    } as Game;

                    const result = await gameValidationService.mapToMatrix(game);
                    expect(result).toEqual([
                        [1, 0, 0],
                        [0, 1, 0],
                    ]);
                });
            });

            // Test isValid (method utilisée dans le BFS)
            describe('isValid', () => {
                it('should return true for valid tile coordinates and conditions', () => {
                    const map = [
                        [0, 1, 0],
                        [0, 1, 0],
                    ];
                    const visited = [
                        [false, false, false],
                        [false, false, false],
                    ];

                    const result = gameValidationService.isValidForTraversal(0, 0, map, visited);
                    expect(result).toBe(true);
                });
            });

            // // Test bfs
            // describe('bfs', () => {
            //     it('should mark all reachable tiles as visited', async () => {
            //         const map = [
            //             [0, 1, 0],
            //             [0, 1, 0],
            //         ];
            //         const visited = [
            //             [false, false, false],
            //             [false, false, false],
            //         ];

            //         await gameValidationService.bfs(map, 0, 0, visited);

            //         expect(visited).toEqual([
            //             [true, false, true],
            //             [true, false, true],
            //         ]);
            //     });
            // });

            // Test mapIsValid
            describe('mapIsValid', () => {
                it('should return false if there are inaccessible tiles', async () => {
                    const game: Game = {
                        name: 'Test Game',
                        description: 'Test Description',
                        size: MapSize.SMALL,
                        tiles: [
                            [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                            [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Grass }],
                        ],
                    } as Game;

                    const result = await gameValidationService.mapIsValid(game);
                    expect(result).toBe(false);
                });

                it('should return true if all tiles are accessible', async () => {
                    const game: Game = {
                        name: 'Test Game',
                        description: 'Test Description',
                        size: MapSize.SMALL,
                        tiles: [
                            [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                            [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                        ],
                    } as Game;

                    const result = await gameValidationService.mapIsValid(game);
                    expect(result).toBe(true);
                });
            });

            // Test isHalfMapTilesValid
            describe('isHalfMapTilesValid', () => {
                it('should return true if more than half of the tiles are terrain tiles', async () => {
                    const game: Game = {
                        name: 'Test Game',
                        description: 'Test Description',
                        size: MapSize.SMALL,
                        tiles: [
                            [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                            [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                        ],
                    } as Game;

                    const result = await gameValidationService.isHalfMapTilesValid(game);
                    expect(result).toBe(true);
                });

                it('should return false if less than half of the tiles are terrain tiles', async () => {
                    const game: Game = {
                        name: 'Test Game',
                        description: 'Test Description',
                        size: MapSize.SMALL,
                        tiles: [
                            [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Grass }],
                            [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Wall }],
                        ],
                    } as Game;

                    const result = await gameValidationService.isHalfMapTilesValid(game);
                    expect(result).toBe(false);
                });
            });
        });
    });

    function createValidTiles(size: number): Tile[][] {
        const tiles: Tile[][] = [];
        let spawnCount = appropriateSpawnCount(size);
        for (let i = 0; i < size; i++) {
            tiles[i] = [];
            for (let j = 0; j < size; j++) {
                tiles[i][j] = { type: TileType.Grass }; // All tiles are grass for a valid map
                if (spawnCount > 0) {
                    tiles[i][j].item = { type: ItemType.Spawn };
                    spawnCount--;
                }
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

    function appropriateSpawnCount(size: number): number {
        let spawnCount = 0;
        switch (size) {
            case MapSize.SMALL:
                spawnCount = SMALL_MAP_SPAWN_COUNT;
                break;
            case MapSize.MEDIUM:
                spawnCount = MEDIUM_MAP_SPAWN_COUNT;
                break;
            case MapSize.LARGE:
                spawnCount = LARGE_MAP_SPAWN_COUNT;
                break;
            default:
                spawnCount = 0;
        }
        return spawnCount;
    }

    // function createTilesWithInvalidSpawn(size: number): Tile[][] {
    //     const tiles: Tile[][] = [];
    //     let invalidSpawnCount = 0;
    //     switch (size) {
    //         case MapSize.SMALL:
    //             invalidSpawnCount = 4;
    //         case MapSize.MEDIUM:
    //             invalidSpawnCount = 2;
    //         case MapSize.LARGE:
    //             invalidSpawnCount = 7;
    //         default:
    //             invalidSpawnCount = 0;
    //     }
    //     for (let i = 0; i < size; i++) {
    //         tiles[i] = [];
    //         for (let j = 0; j < size; j++) {
    //             tiles[i][j] = { type: TileType.Grass };
    //             if (invalidSpawnCount > 0) {
    //                 tiles[i][j].item.type = ItemType.Spawn;
    //                 invalidSpawnCount--;
    //             }
    //         }
    //     }
    //     return tiles;
    // }
});
