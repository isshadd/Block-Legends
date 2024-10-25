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
import { Vec2 } from '@common/interfaces/vec2';
import { ItemFactoryService } from './item-factory.service';
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

    getTileAt(coordinates: Vec2): Tile {
        return this.currentGrid[coordinates.x][coordinates.y];
    }
}
