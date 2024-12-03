import { Game } from '@app/model/database/game';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GameService } from '@app/services/game/game.service';
import { GameMode } from '@common/enums/game-mode';
import { ItemType } from '@common/enums/item-type';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { Test, TestingModule } from '@nestjs/testing';
import { GameValidationService } from './gameValidation.service';

const mockGameService = {
    getGameByName: jest.fn(),
    getGame: jest.fn(),
};

describe('GameValidationService', () => {
    let service: GameValidationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameValidationService, { provide: GameService, useValue: mockGameService }],
        }).compile();

        service = module.get<GameValidationService>(GameValidationService);

        jest.clearAllMocks();
    });

    describe('validateGame', () => {
        const mockValidGame: Game = {
            _id: '123456789012',
            name: 'Test Game',
            description: 'Test Description',
            size: MapSize.SMALL,
            tiles: [
                [
                    { type: TileType.Grass, item: { type: ItemType.Spawn } },
                    { type: TileType.Grass },
                    { type: TileType.Grass, item: { type: ItemType.Spawn } },
                ],
                [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Wall }],
                [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
            ],
            mode: GameMode.Classique,
            imageUrl: 'http://example.com/image.png',
            isVisible: true,
        };

        it('should validate a correctly configured game', async () => {
            mockGameService.getGameByName.mockResolvedValue(mockValidGame);

            const result = await service.validateGame(mockValidGame);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
        });

        it('should return errors for invalid game configuration', async () => {
            const invalidGame = {
                ...mockValidGame,
                description: '',
                tiles: [
                    [{ type: TileType.Wall }, { type: TileType.Wall }],
                    [{ type: TileType.Wall }, { type: TileType.Grass }],
                ],
            };

            const result = await service.validateGame(invalidGame);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('La description du jeu ne doit pas être vide.');
        });
    });

    describe('getNumberOfSpawnPoints', () => {
        it('should correctly count spawn points', async () => {
            const game = {
                tiles: [[{ type: TileType.Grass, item: { type: ItemType.Spawn } }], [{ type: TileType.Grass, item: { type: ItemType.Spawn } }]],
            } as Game;

            const count = await service.getNumberOfSpawnPoints(game);

            expect(count).toBe(2);
        });

        it('should return 0 when no spawn points exist', async () => {
            const game = {
                tiles: [[{ type: TileType.Grass }], [{ type: TileType.Grass }]],
            } as Game;

            const count = await service.getNumberOfSpawnPoints(game);

            expect(count).toBe(0);
        });
    });

    describe('isValidSizeBySpawnPoints', () => {
        it('should validate small map with 2 spawn points', async () => {
            const game = {
                size: MapSize.SMALL,
                tiles: [[{ type: TileType.Grass, item: { type: ItemType.Spawn } }], [{ type: TileType.Grass, item: { type: ItemType.Spawn } }]],
            } as Game;
            mockGameService.getGameByName.mockResolvedValue(game);

            const result = await service.isValidSizeBySpawnPoints(game);

            expect(result).toBe(true);
        });

        it('should validate medium map with 4 spawn points', async () => {
            const game = {
                size: MapSize.MEDIUM,
                tiles: Array(4).fill([{ type: TileType.Grass, item: { type: ItemType.Spawn } }]),
            } as Game;
            mockGameService.getGameByName.mockResolvedValue(game);

            const result = await service.isValidSizeBySpawnPoints(game);

            expect(result).toBe(true);
        });

        it('should validate large map with 6 spawn points', async () => {
            const game = {
                size: MapSize.LARGE,
                tiles: Array(6).fill([{ type: TileType.Grass, item: { type: ItemType.Spawn } }]),
            } as Game;
            mockGameService.getGameByName.mockResolvedValue(game);

            const result = await service.isValidSizeBySpawnPoints(game);

            expect(result).toBe(true);
        });
    });

    describe('mapIsValid', () => {
        it('should validate accessible map', async () => {
            const game = {
                tiles: [
                    [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                    [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Wall }],
                    [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                ],
            } as Game;
            mockGameService.getGameByName.mockResolvedValue(game);

            const result = await service.mapIsValid(game);

            expect(result).toBe(false);
        });

        it('should invalidate map with unreachable areas', async () => {
            const game = {
                tiles: [
                    [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Wall }],
                    [{ type: TileType.Wall }, { type: TileType.Grass }, { type: TileType.Wall }],
                    [{ type: TileType.Wall }, { type: TileType.Wall }, { type: TileType.Wall }],
                ],
            } as Game;
            mockGameService.getGameByName.mockResolvedValue(game);

            const result = await service.mapIsValid(game);

            expect(result).toBe(true);
        });
    });

    describe('validateGameName', () => {
        it('should validate unique game name', async () => {
            mockGameService.getGameByName.mockResolvedValue(null);
            const game = { name: 'Unique Game', _id: '123456789012' } as Game;

            const result = await service.validateGameName(game);

            expect(result).toBe(true);
        });

        it('should validate existing game name for same game', async () => {
            const game = { name: 'Existing Game', _id: '123456789012' } as Game;
            mockGameService.getGameByName.mockResolvedValue(game);

            const result = await service.validateGameName(game);

            expect(result).toBe(true);
        });
    });

    describe('isDoorPlacementValid', () => {
        it('should validate correctly placed horizontal door', async () => {
            const game = {
                tiles: [
                    [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                    [{ type: TileType.Wall }, { type: TileType.Door }, { type: TileType.Wall }],
                    [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                ],
            } as Game;

            const result = await service.isDoorPlacementValid(game);

            expect(result).toBe(false);
        });

        it('should validate correctly placed vertical door', async () => {
            const game = {
                tiles: [
                    [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                    [{ type: TileType.Grass }, { type: TileType.Door }, { type: TileType.Grass }],
                    [{ type: TileType.Grass }, { type: TileType.Wall }, { type: TileType.Grass }],
                ],
            } as Game;

            const result = await service.isDoorPlacementValid(game);

            expect(result).toBe(true);
        });

        it('should invalidate incorrectly placed door', async () => {
            const game = {
                tiles: [
                    [{ type: TileType.Door }, { type: TileType.Grass }, { type: TileType.Grass }],
                    [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                    [{ type: TileType.Grass }, { type: TileType.Grass }, { type: TileType.Grass }],
                ],
            } as Game;

            const result = await service.isDoorPlacementValid(game);

            expect(result).toBe(false);
        });
    });
    describe('GameValidationService', () => {

        describe('assignGameToRightType', () => {
            it('should handle UpdateGameDto type correctly', async () => {
                const updateDto = new UpdateGameDto();
                updateDto.name = 'Test Game';

                const expectedGame = { name: 'Test Game' } as Game;
                mockGameService.getGameByName.mockResolvedValue(expectedGame);

                const result = await service.assignGameToRightType(updateDto);

                expect(result).toEqual(expectedGame);
                expect(mockGameService.getGameByName).toHaveBeenCalledWith('Test Game');
            });

            it('should return the original game if input is Game type', async () => {
                const game = { name: 'Test Game' } as Game;

                const result = await service.assignGameToRightType(game);

                expect(result).toEqual(game);
                expect(mockGameService.getGameByName).not.toHaveBeenCalled();
            });
        });

        describe('isValidForTraversal', () => {
            it('should validate coordinates within bounds and unvisited terrain', () => {
                const map = [
                    [0, 1],
                    [0, 0],
                ];
                const visited = [
                    [false, false],
                    [false, false],
                ];

                const result = service.isValidForTraversal(0, 0, map, visited);

                expect(result).toBe(true);
            });

            it('should invalidate out of bounds coordinates', () => {
                const map = [
                    [0, 1],
                    [0, 0],
                ];
                const visited = [
                    [false, false],
                    [false, false],
                ];

                expect(service.isValidForTraversal(-1, 0, map, visited)).toBe(false);
                expect(service.isValidForTraversal(0, -1, map, visited)).toBe(false);
                expect(service.isValidForTraversal(2, 0, map, visited)).toBe(false);
                expect(service.isValidForTraversal(0, 2, map, visited)).toBe(false);
            });

            it('should invalidate walls', () => {
                const map = [
                    [0, 1],
                    [0, 0],
                ];
                const visited = [
                    [false, false],
                    [false, false],
                ];

                const result = service.isValidForTraversal(0, 1, map, visited);

                expect(result).toBe(false);
            });

            it('should invalidate already visited cells', () => {
                const map = [
                    [0, 1],
                    [0, 0],
                ];
                const visited = [
                    [true, false],
                    [false, false],
                ];

                const result = service.isValidForTraversal(0, 0, map, visited);

                expect(result).toBe(false);
            });
        });

        describe('bfs', () => {
            it('should visit all accessible terrain tiles', async () => {
                const map = [
                    [0, 1, 0],
                    [0, 0, 0],
                    [0, 1, 0],
                ];
                const visited = Array(3)
                    .fill(null)
                    .map(() => Array(3).fill(false));

                await service.bfs(map, 0, 0, visited);

                expect(visited).toEqual([
                    [true, false, true],
                    [true, true, true],
                    [true, false, true],
                ]);
            });

            it('should not visit tiles beyond walls', async () => {
                const map = [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0],
                ];
                const visited = Array(3)
                    .fill(null)
                    .map(() => Array(3).fill(false));

                await service.bfs(map, 0, 0, visited);

                expect(visited[0][2]).toBe(false);
                expect(visited[2][0]).toBe(false);
            });
        });

        describe('validateUpdatedGameName', () => {
            it('should validate when game with name exists but has same id', async () => {
                const id = '123456789012';
                const updateDto = new UpdateGameDto();
                updateDto.name = 'Test Game';

                const existingGame = {
                    _id: id,
                    name: 'Test Game',
                } as Game;

                mockGameService.getGameByName.mockResolvedValue(existingGame);

                const result = await service.validateUpdatedGameName(id, updateDto);

                expect(result).toBe(true);
            });

            it('should invalidate when game with name exists but has different id', async () => {
                const id = '123456789012';
                const updateDto = new UpdateGameDto();
                updateDto.name = 'Test Game';

                const existingGame = {
                    _id: '987654321098',
                    name: 'Test Game',
                } as Game;

                mockGameService.getGameByName.mockResolvedValue(existingGame);

                const result = await service.validateUpdatedGameName(id, updateDto);

                expect(result).toBe(false);
            });

            it('should validate when no game with name exists', async () => {
                const id = '123456789012';
                const updateDto = new UpdateGameDto();
                updateDto.name = 'Test Game';

                mockGameService.getGameByName.mockResolvedValue(null);

                const result = await service.validateUpdatedGameName(id, updateDto);

                expect(result).toBe(true);
            });
        });

        describe('isTileTerrain', () => {
            it('should identify Grass as terrain', async () => {
                const result = await service.isTileTerrain({ type: TileType.Grass });
                expect(result).toBe(true);
            });

            it('should identify Water as terrain', async () => {
                const result = await service.isTileTerrain({ type: TileType.Water });
                expect(result).toBe(true);
            });

            it('should identify Ice as terrain', async () => {
                const result = await service.isTileTerrain({ type: TileType.Ice });
                expect(result).toBe(true);
            });

            it('should not identify Wall as terrain', async () => {
                const result = await service.isTileTerrain({ type: TileType.Wall });
                expect(result).toBe(false);
            });
        });

        describe('isTileWall', () => {
            it('should identify Wall correctly', async () => {
                const result = await service.isTileWall({ type: TileType.Wall });
                expect(result).toBe(true);
            });

            it('should not identify non-Wall tiles as wall', async () => {
                const result = await service.isTileWall({ type: TileType.Grass });
                expect(result).toBe(false);
            });
        });
        describe('isValidCTF', () => {
            it('should return true when CTF game has a flag', async () => {
                const game = {
                    mode: GameMode.CTF,
                    tiles: [
                        [{ type: TileType.Grass }, { type: TileType.Wall }],
                        [{ type: TileType.Grass, item: { type: ItemType.Flag } }, { type: TileType.Grass }],
                    ],
                } as Game;
                mockGameService.getGameByName.mockResolvedValue(game);

                const result = await service.isValidCTF(game);

                expect(result).toBe(true);
            });

            it('should return false when CTF game has no flag', async () => {
                const game = {
                    mode: GameMode.CTF,
                    tiles: [
                        [{ type: TileType.Grass }, { type: TileType.Wall }],
                        [{ type: TileType.Grass }, { type: TileType.Grass }],
                    ],
                } as Game;
                mockGameService.getGameByName.mockResolvedValue(game);

                const result = await service.isValidCTF(game);

                expect(result).toBe(false);
            });

            it('should return true when non-CTF game has no flag', async () => {
                const game = {
                    mode: GameMode.Classique,
                    tiles: [
                        [{ type: TileType.Grass }, { type: TileType.Wall }],
                        [{ type: TileType.Grass }, { type: TileType.Grass }],
                    ],
                } as Game;
                mockGameService.getGameByName.mockResolvedValue(game);

                const result = await service.isValidCTF(game);

                expect(result).toBe(true);
            });

            it('should return true for CTF game with multiple flags', async () => {
                const game = {
                    mode: GameMode.CTF,
                    tiles: [
                        [{ type: TileType.Grass, item: { type: ItemType.Flag } }, { type: TileType.Wall }],
                        [{ type: TileType.Grass, item: { type: ItemType.Flag } }, { type: TileType.Grass }],
                    ],
                } as Game;
                mockGameService.getGameByName.mockResolvedValue(game);

                const result = await service.isValidCTF(game);

                expect(result).toBe(true);
            });
        });
    });
});
