import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NavBarComponent } from '@app/components/create-game/nav-bar/nav-bar.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
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
    MapSize = MapSize;

    constructor(
        public dialogRef: MatDialogRef<CreateGameModalComponent>,
        private router: Router,
        public gameMapDataManagerService: GameMapDataManagerService,
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onCreateClick(): void {
        if (this.selectedSize) {
            this.dialogRef.close();
            localStorage.setItem('isNewGame', JSON.stringify(true));
            localStorage.setItem(
                'gameToEdit',
                JSON.stringify({
                    _id: '',
                    name: '',
                    description: '',
                    size: this.selectedSize,
                    mode: this.selectedMode,
                    imageUrl:
                        'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
                    isVisible: false,
                    tiles: [],
                }),
            );
            this.router.navigate(['/map-editor']);
        } else {
            this.errorMessage = 'Vous devez sélectionner une taille avant de créer un jeu.';
        }
    }

    selectSize(size: MapSize): void {
        this.selectedSize = size;
        this.errorMessage = '';
    }

    selectMode(mode: GameMode): void {
        this.selectedMode = mode;
    }
}
