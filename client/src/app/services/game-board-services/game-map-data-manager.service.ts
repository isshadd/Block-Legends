import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Item } from '@app/classes/Items/item';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { ErrorModalComponent } from '@app/components/map-editor-components/validation-modal/error-modal/error-modal.component';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { ItemFactoryService } from './item-factory.service';
import { TileFactoryService } from './tile-factory.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapDataManagerService {
    databaseGame: GameShared;
    currentGrid: Tile[][] = [];
    currentName = '';
    currentDescription = '';
    isGameUpdated: boolean = false;

    constructor(
        public tileFactoryService: TileFactoryService,
        public itemFactoryService: ItemFactoryService,
        public gameServerCommunicationService: GameServerCommunicationService,
        public dialog: MatDialog,
    ) {}

    newGame(game: GameShared) {
        this.databaseGame = game;
        this.resetCurrentValues();
        this.createNewGrid();
    }

    loadGame(game: GameShared) {
        this.databaseGame = game;
        this.resetCurrentValues();
        this.loadGrid();
    }

    createNewGrid() {
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
        if (!this.hasValidNameAndDescription()) return;

        this.databaseGame.name = this.currentName;
        this.databaseGame.description = this.currentDescription;
        this.saveMap();

        this.isGameUpdated = false;

        if (this.databaseGame._id === undefined) {
            this.createGameInDb();
        } else {
            this.saveGameInDb();
        }
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

    createGameInDb() {
        this.gameServerCommunicationService.addGame(this.databaseGame).subscribe({
            next: (game: GameShared) => {
                this.databaseGame = game;
                this.setLocalStorageVariables(false, this.databaseGame);
            },
            error: (errors: unknown) => {
                this.isGameUpdated = true;
                this.openErrorModal(errors as string | string[]);
            },
        });
    }

    saveGameInDb() {
        if (!this.isSavedGame()) return;
        if (this.databaseGame._id) {
            this.gameServerCommunicationService.updateGame(this.databaseGame._id, this.databaseGame).subscribe({
                next: () => {
                    this.setLocalStorageVariables(false, this.databaseGame);
                },
                error: (errors: unknown) => {
                    this.isGameUpdated = true;
                    this.openErrorModal(errors as string | string[]);
                },
            });
        }
    }

    saveMap() {
        this.databaseGame.tiles = [];
        for (let i = 0; i < this.currentGrid.length; i++) {
            this.databaseGame.tiles.push([]);
            for (const tile of this.currentGrid[i]) {
                if (this.isTerrainTile(tile)) {
                    const currentTile: TerrainTile = tile as TerrainTile;
                    this.databaseGame.tiles[i].push({
                        type: currentTile.type,
                        item: currentTile.item && this.isItem(currentTile.item) ? { type: currentTile.item.type } : null,
                    });
                } else {
                    this.databaseGame.tiles[i].push({ type: tile.type });
                }
            }
        }
    }

    resetGame() {
        this.resetCurrentValues();
        this.loadGrid();
    }

    resetCurrentValues() {
        this.isGameUpdated = false;
        this.currentName = this.databaseGame.name;
        this.currentDescription = this.databaseGame.description;
        this.currentGrid = [];
    }

    isTerrainTile(tile: Tile): tile is TerrainTile {
        return (tile as TerrainTile).item !== undefined;
    }

    isItem(placeableEntity: PlaceableEntity): placeableEntity is Item {
        return (placeableEntity as Item).testItem !== undefined;
    }

    isDoor(tile: Tile): boolean {
        return tile.type === TileType.Door || tile.type === TileType.OpenDoor;
    }

    hasValidNameAndDescription(): boolean {
        return this.currentName !== '' && this.currentDescription !== '';
    }

    isSavedGame(): boolean {
        if (this.databaseGame === undefined) return false;
        return this.databaseGame._id !== undefined;
    }

    isGameModeCTF() {
        if (this.databaseGame === undefined) return false;
        return this.databaseGame.mode === GameMode.CTF;
    }

    gameSize(): MapSize {
        return this.databaseGame.size;
    }

    itemLimit(): number {
        const ITEM_LIMITS = {
            [MapSize.SMALL]: 2,
            [MapSize.MEDIUM]: 4,
            [MapSize.LARGE]: 6,
        };

        return ITEM_LIMITS[this.gameSize()];
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
