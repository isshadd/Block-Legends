import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { ItemFactoryService } from './item-factory.service';
import { TileFactoryService } from './tile-factory.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapDataManagerService {
    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
    ) {
        this.createNewGrid();
    }

    game: GameShared = {
        name: '',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.Classique,
        imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
        isVisible: false,
        tiles: [],
    };

    grid: Tile[][] = [];

    newGame(size: MapSize, mode: GameMode) {
        this.game = {
            name: '',
            description: '',
            size: size,
            mode: mode,
            imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            isVisible: false,
            tiles: [],
        };
        this.createNewGrid();
    }

    loadGame(game: GameShared) {
        this.game = game;
        this.loadGrid();
    }

    createNewGrid() {
        this.grid = [];
        this.game.tiles = [];

        for (let i = 0; i < this.game.size; i++) {
            this.grid.push([]);
            this.game.tiles.push([]);
            for (let j = 0; j < this.game.size; j++) {
                const newTile: GrassTile = new GrassTile();
                this.grid[i].push(newTile);
                this.game.tiles[i].push({ type: newTile.type });
                newTile.coordinates = { x: i, y: j };
            }
        }
    }

    loadGrid() {
        this.grid = [];
        for (let i = 0; i < this.game.tiles.length; i++) {
            this.grid.push([]);
            for (let j = 0; j < this.game.tiles[i].length; j++) {
                const newTile: Tile = this.tileFactoryService.createTile(this.game.tiles[i][j].type);
                this.grid[i].push(newTile);
                newTile.coordinates = { x: i, y: j };

                if (this.isTerrainTile(newTile)) {
                    const itemType = this.game.tiles[i][j].item?.type;
                    if (itemType) newTile.item = this.itemFactoryService.createItem(itemType);
                }
            }
        }
    }

    saveMap() {
        this.game.tiles = [];
        for (let i = 0; i < this.grid.length; i++) {
            this.game.tiles.push([]);
            for (let j = 0; j < this.grid[i].length; j++) {
                this.game.tiles[i].push({
                    type: this.grid[i][j].type,
                    item:
                        this.isTerrainTile(this.grid[i][j]) && (this.grid[i][j] as TerrainTile).item?.type !== undefined
                            ? { type: (this.grid[i][j] as TerrainTile).item!.type }
                            : null,
                });
            }
        }
    }

    resetGame() {
        this.loadGrid();
    }

    isTerrainTile(tile: Tile): tile is TerrainTile {
        return (tile as TerrainTile).item !== undefined;
    }

    isItem(placeableEntity: PlaceableEntity): placeableEntity is Item {
        return (placeableEntity as Item).testItem !== undefined;
    }
}
