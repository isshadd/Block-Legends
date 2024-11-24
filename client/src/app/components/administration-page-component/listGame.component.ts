import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteConfirmationComponent } from '@app/components/administration-page-component/delete-conformation/delete-conformation.component';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.service';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { Tile } from '@common/classes/Tiles/tile';
import { GameShared } from '@common/interfaces/game-shared';

@Component({
    selector: 'app-list-game',
    templateUrl: './listGame.component.html',
    styleUrls: ['./listGame.component.scss'],
    imports: [CommonModule, MapComponent],
    standalone: true,
})
export class ListGameComponent {
    databaseGames: GameShared[] = [];
    loadedTiles: Tile[][][] = [];

    constructor(
        private administrationService: AdministrationPageManagerService,
        public gameMapDataManagerService: GameMapDataManagerService,
        public tileFactoryService: TileFactoryService,
        private router: Router,
        private dialog: MatDialog,
    ) {
        this.administrationService.signalGamesSetted$.subscribe((games) => this.getGames(games));
        this.administrationService.setGames();
    }

    getGames(games: GameShared[]): void {
        this.databaseGames = games;
        this.loadedTiles = this.databaseGames.map((game) => this.tileFactoryService.loadGridFromJSON(game.tiles));
    }

    deleteGame(id: string | null | undefined): void {
        if (!id) return;
        this.administrationService.deleteGame(id);
        this.openDeleteConfirmation();
    }

    openDeleteConfirmation(): void {
        this.dialog.open(DeleteConfirmationComponent, {
            width: '300px',
        });
    }

    toggleVisibility(game: GameShared): void {
        this.administrationService.toggleVisibility(game);
    }

    editGame(game: GameShared): void {
        this.gameMapDataManagerService.setLocalStorageVariables(false, game);
        this.router.navigate(['/map-editor']);
    }
}
