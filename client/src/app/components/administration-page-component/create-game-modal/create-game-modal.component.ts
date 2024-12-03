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
    templateUrl: './create-game-modal.component.html',
    styleUrls: ['./create-game-modal.component.scss'],
    imports: [NavBarComponent, CommonModule],
})
export class CreateGameModalComponent {
    selectedSize: MapSize = MapSize.SMALL;
    selectedMode: GameMode = GameMode.Classique;
    mapSize = MapSize;

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
            this.gameMapDataManagerService.setLocalStorageVariables(true, {
                name: '',
                description: '',
                size: this.selectedSize,
                mode: this.selectedMode,
                imageUrl:
                    'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
                isVisible: false,
                tiles: [],
            });
            this.router.navigate(['/map-editor']);
        }
    }

    selectSize(size: MapSize): void {
        this.selectedSize = size;
    }

    selectMode(mode: GameMode): void {
        this.selectedMode = mode;
    }
}
