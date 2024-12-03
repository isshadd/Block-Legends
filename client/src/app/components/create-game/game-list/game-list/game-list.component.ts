import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { ModalOneOptionComponent } from '@app/components/modal-one-option/modal-one-option.component';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory.service';
import { ModeService } from '@app/services/game-mode-services/gameMode.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { Tile } from '@common/classes/Tiles/tile';
import { GameMode } from '@common/enums/game-mode';
import { GameShared } from '@common/interfaces/game-shared';

@Component({
    selector: 'app-game-list',
    standalone: true,
    imports: [CommonModule, ModalOneOptionComponent, MapComponent],
    templateUrl: './game-list.component.html',
    styleUrl: './game-list.component.scss',
})
export class GameListComponent {
    databaseGames: GameShared[] = [];
    loadedTiles: Tile[][][] = [];
    selectedGame: GameShared | null;
    gameStatus: string | null;
    selectedMode: GameMode = GameMode.Classique;
    isModalOpen = false;

    constructor(
        private modeService: ModeService,
        private router: Router,
        public tileFactoryService: TileFactoryService,
        private administrationService: AdministrationPageManagerService,
        private gameServerCommunicationService: GameServerCommunicationService,
    ) {
        this.modeService.selectedMode$.subscribe((mode) => {
            this.selectedMode = mode;
        });
        this.administrationService.signalGamesSetted$.subscribe((games) => this.getGames(games));
        this.administrationService.setGames();
    }

    getGames(games: GameShared[]): void {
        this.databaseGames = games;
        this.loadedTiles = this.databaseGames.map((game) => this.tileFactoryService.loadGridFromJSON(game.tiles));
    }

    homeButton() {
        this.router.navigate(['/home']);
    }

    selectGame(game: GameShared) {
        this.gameServerCommunicationService.getGame(game._id).subscribe((updatedGame: GameShared) => {
            if (!updatedGame || !updatedGame.isVisible) {
                this.gameStatus = `Le jeu choisi ${updatedGame ? updatedGame.name : ''} n'est plus disponible`;
                this.selectedGame = null;
            } else {
                this.selectedGame = updatedGame;
                this.gameStatus = null;
                this.router.navigate(['/create-character'], { queryParams: { id: this.selectedGame._id } });
            }
        });
    }

    getFilteredGames() {
        return this.databaseGames.filter((game) => game.isVisible && game.mode === this.selectedMode && game != null);
    }

    findDatabaseGameIndex(game: GameShared): number {
        return this.databaseGames.findIndex((dbGame) => dbGame._id === game._id);
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.gameStatus = null;
    }

    confirmBack() {
        this.closeModal();
        window.location.reload();
    }
}
