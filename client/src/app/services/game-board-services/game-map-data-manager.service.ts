import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { GameServerCommunicationService } from '../game-server-communication.service';
import { ItemFactoryService } from './item-factory.service';
import { TileFactoryService } from './tile-factory.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapDataManagerService {
    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
        public gameServerCommunicationService: GameServerCommunicationService,
    ) {
        this.createNewGrid();
    }

    databaseGame: GameShared = {
        name: '',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.Classique,
        imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
        isVisible: false,
        tiles: [],
    };

    currentGrid: Tile[][] = [];
    currentName = '';
    currentDescription = '';

    newGame(size: MapSize, mode: GameMode) {
        this.databaseGame = {
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
        this.databaseGame = game;
        this.currentName = game.name;
        this.currentDescription = game.description;
        this.loadGrid();
    }

    createNewGrid() {
        this.currentGrid = [];
        this.databaseGame.tiles = [];

        for (let i = 0; i < this.databaseGame.size; i++) {
            this.currentGrid.push([]);
            this.databaseGame.tiles.push([]);
            for (let j = 0; j < this.databaseGame.size; j++) {
                const newTile: GrassTile = new GrassTile();
                this.currentGrid[i].push(newTile);
                this.databaseGame.tiles[i].push({ type: newTile.type });
                newTile.coordinates = { x: i, y: j };
            }
        }
    }

    loadGrid() {
        this.currentGrid = [];
        for (let i = 0; i < this.databaseGame.tiles.length; i++) {
            this.currentGrid.push([]);
            for (let j = 0; j < this.databaseGame.tiles[i].length; j++) {
                const newTile: Tile = this.tileFactoryService.createTile(this.databaseGame.tiles[i][j].type);
                this.currentGrid[i].push(newTile);
                newTile.coordinates = { x: i, y: j };

                if (this.isTerrainTile(newTile)) {
                    const itemType = this.databaseGame.tiles[i][j].item?.type;
                    if (itemType) newTile.item = this.itemFactoryService.createItem(itemType);
                }
            }
        }
    }

    save() {
        if (this.currentName === '' || this.currentDescription === '') return;

        this.databaseGame.name = this.currentName;
        this.databaseGame.description = this.currentDescription;
        this.saveMap();

        if (this.databaseGame._id === undefined) {
            this.createGameInDb();
        } else {
            this.saveGameInDb();
        }
    }

    createGameInDb() {
        this.gameServerCommunicationService.addGame(this.databaseGame).subscribe((game) => {
            this.databaseGame = game;
        });
    }

    saveGameInDb() {
        if (this.databaseGame._id === undefined) return;
        this.gameServerCommunicationService.updateGame(this.databaseGame._id, this.databaseGame).subscribe();
    }

    saveMap() {
        this.databaseGame.tiles = [];
        for (let i = 0; i < this.currentGrid.length; i++) {
            this.databaseGame.tiles.push([]);
            for (let j = 0; j < this.currentGrid[i].length; j++) {
                this.databaseGame.tiles[i].push({
                    type: this.currentGrid[i][j].type,
                    item:
                        this.isTerrainTile(this.currentGrid[i][j]) && (this.currentGrid[i][j] as TerrainTile).item?.type !== undefined
                            ? { type: (this.currentGrid[i][j] as TerrainTile).item!.type }
                            : null,
                });
            }
        }
    }

    resetGame() {
        this.currentName = this.databaseGame.name;
        this.currentDescription = this.databaseGame.description;
        this.loadGrid();
    }

    isTerrainTile(tile: Tile): tile is TerrainTile {
        return (tile as TerrainTile).item !== undefined;
    }

    isItem(placeableEntity: PlaceableEntity): placeableEntity is Item {
        return (placeableEntity as Item).testItem !== undefined;
    }
}
