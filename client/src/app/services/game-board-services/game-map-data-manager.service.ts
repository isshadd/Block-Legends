import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { ErrorModalComponent } from '@app/components/map-editor-components/validation-modal/error-modal/error-modal.component';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { TileShared } from '@common/interfaces/tile-shared';
import { ItemFactoryService } from './item-factory.service';
import { TileFactoryService } from './tile-factory.service';

@Injectable({
    providedIn: 'root',
})
export class GameMapDataManagerService {
    private databaseGame: GameShared;
    private lastSavedGrid: TileShared[][];
    private currentGrid: Tile[][] = [];
    currentName = '';
    currentDescription = '';

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

    private resetCurrentValues() {
        this.currentName = this.databaseGame.name;
        this.currentDescription = this.databaseGame.description;
        this.currentGrid = [];
    }

    private loadGrid() {
        if (this.isNewGame()) {
            this.createNewGrid();
            return;
        }

        for (let i = 0; i < this.lastSavedGrid.length; i++) {
            this.currentGrid.push([]);
            for (let j = 0; j < this.lastSavedGrid[i].length; j++) {
                const newTile: Tile = this.tileFactoryService.createTile(this.lastSavedGrid[i][j].type);
                this.currentGrid[i].push(newTile);
                newTile.coordinates = { x: i, y: j };

                if (newTile.isTerrain()) {
                    const itemType = this.lastSavedGrid[i][j].item?.type;
                    if (itemType) (newTile as TerrainTile).item = this.itemFactoryService.createItem(itemType);
                }
            }
        }
    }

    private createNewGrid() {
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

    private saveMap() {
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

    private createGameInDb() {
        this.gameServerCommunicationService.addGame(this.databaseGame).subscribe({
            next: () => {
                this.router.navigate(['/administration-game']);
            },
            error: (errors: unknown) => {
                this.openErrorModal(errors as string | string[]);
            },
        });
    }

    private saveGameInDb() {
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
