import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NavBarComponent } from '@app/components/create-game/nav-bar/nav-bar.component';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';

@Component({
    selector: 'app-create-game-modal',
    standalone: true,
    templateUrl: './createGameModal.component.html',
    styleUrls: ['./createGameModal.component.scss'],
    imports: [NavBarComponent, CommonModule],
})
export class CreateGameModalComponent {
    selectedSize: MapSize = MapSize.SMALL;
    selectedMode: GameMode = GameMode.Classique;
    errorMessage: string = '';
    MAP_SIZES = {
        SMALL: MapSize.SMALL,
        MEDIUM: MapSize.MEDIUM,
        LARGE: MapSize.LARGE,
    };

    constructor(
        public dialogRef: MatDialogRef<CreateGameModalComponent>,
        private router: Router,
        public mapEditorManagerService: MapEditorManagerService,
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onCreateClick(): void {
        if (this.selectedSize) {
            this.dialogRef.close();
            this.mapEditorManagerService.newGame(this.selectedSize, this.selectedMode);
            this.router.navigate(['/map-editor']);
        } else {
            this.errorMessage = 'Vous devez sélectionner une taille avant de créer un jeu.';
        }
    }

    selectSize(size: MapSize): void {
        this.selectedSize = size;
        this.errorMessage = '';
    }
}
