import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorModalComponent } from '@app/components/map-editor-components/validation-modal/error-modal/error-modal.component';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { GameMode } from '@common/enums/game-mode';
import { ItemType } from '@common/enums/item-type';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { TileShared } from '@common/interfaces/tile-shared';
import { Vec2 } from '@common/interfaces/vec2';
import { ItemFactoryService } from './item-factory.service';
import { Pathfinder } from './path-finder';
import { TileFactoryService } from './tile-factory.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapDataManagerService {
    currentName = '';
    currentDescription = '';
    private databaseGame: GameShared;
    private lastSavedGrid: TileShared[][];
    private currentGrid: Tile[][] = [];

    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
        public gameServerCommunicationService: GameServerCommunicationService,
        public dialog: MatDialog,
        private router: Router,
    ) {}

    init(game: GameShared) {
        this.databaseGame = game;
        this.lastSavedGrid = this.databaseGame.tiles;
        this.resetGame();
    }

    resetGame() {
        this.resetCurrentValues();
        this.loadGrid();
    }

    saveGame() {
        if (!this.hasValidNameAndDescription()) return;

        this.databaseGame.name = this.currentName;
        this.databaseGame.description = this.currentDescription;
        this.saveMap();

        if (this.isNewGame()) {
            this.createGameInDb();
        } else {
            this.saveGameInDb();
        }
    }

    async convertJsonToGameShared(jsonFile: File): Promise<GameShared> {
        const jsonText = await jsonFile.text();

        const jsonObject = JSON.parse(jsonText);

        const gameShared: GameShared = {
            _id: jsonObject._id,
            createdAt: jsonObject.createdAt ? new Date(jsonObject.createdAt) : undefined,
            updatedAt: jsonObject.updatedAt ? new Date(jsonObject.updatedAt) : undefined,
            name: jsonObject.name,
            description: jsonObject.description,
            size: jsonObject.size as MapSize,
            mode: jsonObject.mode as GameMode,
            imageUrl: jsonObject.imageUrl,
            isVisible: jsonObject.isVisible,
            tiles: jsonObject.tiles.map((row: unknown[]) =>
                row.map(
                    (tile: unknown) =>
                        ({
                            ...(tile as object),
                        }) as TileShared,
                ),
            ),
        };

        return gameShared;
    }

    resetCurrentValues() {
        this.currentName = this.databaseGame.name;
        this.currentDescription = this.databaseGame.description;
        this.currentGrid = [];
    }

    loadGrid() {
        if (this.isNewGame()) {
            this.createNewGrid();
            return;
        }

        this.currentGrid = this.tileFactoryService.loadGridFromJSON(this.lastSavedGrid);
    }

    createNewGrid() {
        this.lastSavedGrid = [];
        for (let i = 0; i < this.databaseGame.size; i++) {
            this.currentGrid.push([]);
            this.lastSavedGrid.push([]);
            for (let j = 0; j < this.databaseGame.size; j++) {
                const newTile: GrassTile = new GrassTile();
                this.currentGrid[i].push(newTile);
                this.lastSavedGrid[i].push({ type: newTile.type });
                newTile.coordinates = { x: i, y: j };
            }
        }
    }

    saveMap() {
        this.databaseGame.tiles = [];

        for (let i = 0; i < this.currentGrid.length; i++) {
            this.databaseGame.tiles.push([]);
            for (const tile of this.currentGrid[i]) {
                if (tile.isTerrain()) {
                    const currentTile = tile as TerrainTile;
                    this.databaseGame.tiles[i].push({
                        type: currentTile.type,
                        item: currentTile.item && currentTile.item.isItem() ? { type: currentTile.item.type } : null,
                    });
                } else {
                    this.databaseGame.tiles[i].push({ type: tile.type });
                }
            }
        }
    }

    createGameInDb() {
        this.gameServerCommunicationService.addGame(this.databaseGame).subscribe({
            next: () => {
                this.router.navigate(['/administration-game']);
            },
            error: (errors: unknown) => {
                this.openErrorModal(errors as string | string[]);
            },
        });
    }

    saveGameInDb() {
        if (!this.databaseGame._id) return;

        this.gameServerCommunicationService.updateGame(this.databaseGame._id, this.databaseGame).subscribe({
            next: () => {
                this.router.navigate(['/administration-game']);
            },
            error: (errors: unknown) => {
                this.openErrorModal(errors as string | string[]);
            },
        });
    }

    getCurrentGrid(): Tile[][] {
        return this.currentGrid;
    }

    getTilesWithSpawn(): TerrainTile[] {
        const tilesWithSpawn: TerrainTile[] = [];
        for (const row of this.currentGrid) {
            for (const tile of row) {
                if (tile.isTerrain() && (tile as TerrainTile).item?.type === ItemType.Spawn) {
                    tilesWithSpawn.push(tile as TerrainTile);
                }
            }
        }
        return tilesWithSpawn;
    }

    getPossibleMovementTiles(coordinates: Vec2, movePoints: number): Map<Tile, Tile[]> {
        const pathfinder = new Pathfinder(this, movePoints);
        return pathfinder.findAllReachableTiles(coordinates);
    }

    getTileAt(coordinates: Vec2): Tile | null {
        if (coordinates.x < 0 || coordinates.x >= this.currentGrid.length || coordinates.y < 0 || coordinates.y >= this.currentGrid.length)
            return null;
        return this.currentGrid[coordinates.x][coordinates.y];
    }

    getClosestWalkableTileWithoutPlayerAt(mapPlayer: PlayerMapEntity): WalkableTile {
        const coordinates = mapPlayer.spawnCoordinates;
        const tile = this.getTileAt(coordinates);
        if (tile && tile.isWalkable() && (!(tile as WalkableTile).hasPlayer() || (tile as WalkableTile).player === mapPlayer)) {
            return tile as WalkableTile;
        }

        const queue: Vec2[] = [coordinates];
        const visited: Set<string> = new Set();
        visited.add(`${coordinates.x},${coordinates.y}`);

        while (queue.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const current = queue.shift()!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const neighbours = this.getNeighbours(this.getTileAt(current)!);

            for (const neighbour of neighbours) {
                const key = `${neighbour.coordinates.x},${neighbour.coordinates.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    if (neighbour.isWalkable() && !(neighbour as WalkableTile).hasPlayer()) {
                        return neighbour as WalkableTile;
                    }
                    queue.push(neighbour.coordinates);
                }
            }
        }

        throw new Error('No walkable tile found');
    }

    getClosestTerrainTileWithoutItemAt(startTile: Tile): TerrainTile {
        if (startTile && startTile.isTerrain() && !(startTile as TerrainTile).item) {
            return startTile as TerrainTile;
        }

        const queue: Vec2[] = [startTile.coordinates];
        const visited: Set<string> = new Set();
        visited.add(`${startTile.coordinates.x},${startTile.coordinates.y}`);

        while (queue.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const current = queue.shift()!;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const neighbours = this.getNeighbours(this.getTileAt(current)!);

            for (const neighbour of neighbours) {
                const key = `${neighbour.coordinates.x},${neighbour.coordinates.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    if (neighbour.isTerrain() && !(neighbour as TerrainTile).item && !(neighbour as TerrainTile).hasPlayer()) {
                        return neighbour as TerrainTile;
                    }
                    queue.push(neighbour.coordinates);
                }
            }
        }

        throw new Error('No terrain tile found');
    }

    setTileAt(coordinates: Vec2, tile: Tile) {
        this.currentGrid[coordinates.x][coordinates.y] = tile;
    }

    getNeighbours(tile: Tile): Tile[] {
        const neighbours: Tile[] = [];
        const directions: Vec2[] = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
        ];

        directions.forEach((direction) => {
            const neighbour = this.getTileAt({ x: tile.coordinates.x + direction.x, y: tile.coordinates.y + direction.y });
            if (neighbour) {
                neighbours.push(neighbour);
            }
        });

        return neighbours;
    }

    setLocalStorageVariables(isNewGame: boolean, game: GameShared) {
        localStorage.setItem('isNewGame', JSON.stringify(isNewGame));
        localStorage.setItem('gameToEdit', JSON.stringify(game));
    }

    getLocalStorageIsNewGame(): boolean {
        return JSON.parse(localStorage.getItem('isNewGame') || 'false');
    }

    getLocalStorageGameToEdit(): GameShared {
        return JSON.parse(localStorage.getItem('gameToEdit') || '{}');
    }

    hasValidNameAndDescription(): boolean {
        return this.currentName !== '' && this.currentDescription !== '';
    }

    isNewGame(): boolean {
        return this.databaseGame._id === undefined;
    }

    isGameModeCTF() {
        return this.databaseGame.mode === GameMode.CTF;
    }

    gameSize(): MapSize | undefined {
        if (!this.databaseGame) return undefined;
        return this.databaseGame.size;
    }

    itemLimit(): number {
        const ITEM_LIMITS = {
            [MapSize.SMALL]: 2,
            [MapSize.MEDIUM]: 4,
            [MapSize.LARGE]: 6,
        };

        return ITEM_LIMITS[this.gameSize() || MapSize.SMALL];
    }

    openErrorModal(message: string | string[]) {
        if (Array.isArray(message)) {
            message = message.join('<br>');
        }
        this.dialog.open(ErrorModalComponent, {
            data: { message },
        });
    }
}
