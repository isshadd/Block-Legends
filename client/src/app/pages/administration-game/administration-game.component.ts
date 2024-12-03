import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { CreateGameModalComponent } from '@app/components/administration-page-component/create-game-modal/create-game-modal.component';
import { ListGameComponent } from '@app/components/administration-page-component/list-game/list-game.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';

@Component({
    selector: 'app-administration-game',
    standalone: true,
    imports: [CommonModule, RouterLink, ListGameComponent],
    templateUrl: './administration-game.component.html',
    styleUrls: ['./administration-game.component.scss'],
})
export class AdministrationGameComponent {
    selectedFile: File | null = null;

    constructor(
        public dialog: MatDialog,
        private gameServerCommunicationService: GameServerCommunicationService,
        private gameMapDataManagerService: GameMapDataManagerService,
    ) {}

    openCreateGameModal(): void {
        this.dialog.open(CreateGameModalComponent);
    }

    triggerFileInput(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    async onFileChange(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile = input.files[0];
            try {
                const importedGame = await this.gameMapDataManagerService.convertJsonToGameShared(this.selectedFile);
                this.gameServerCommunicationService.addGame(importedGame).subscribe({
                    next: () => {
                        window.location.reload();
                    },
                    // this is necessary to be able to test the component and cannot be refactored
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    error: (errors: any) => {
                        if (typeof errors === 'string' || Array.isArray(errors)) {
                            this.gameMapDataManagerService.openErrorModal(errors);
                        } else {
                            this.gameMapDataManagerService.openErrorModal(
                                errors.message || "Impossible d'importer le fichier <br> Veuillez vérifier le format du fichier.",
                            );
                        }
                    },
                });
            } catch (error) {
                this.gameMapDataManagerService.openErrorModal("Impossible d'importer le fichier <br> Veuillez vérifier le format du fichier.");
            }
        }
    }
}
