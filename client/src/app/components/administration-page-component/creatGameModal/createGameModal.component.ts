import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NavBarComponent } from '@app/components/create-game/nav-bar/nav-bar.component';

@Component({
    selector: 'app-create-game-modal',
    standalone: true,
    templateUrl: './createGameModal.component.html',
    styleUrls: ['./createGameModal.component.scss'],
    imports: [NavBarComponent, CommonModule],
})
export class CreateGameModalComponent {
    selectedSize: string | null = null;
    errorMessage: string = '';

    constructor(
        public dialogRef: MatDialogRef<CreateGameModalComponent>,
        private router: Router,
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onCreateClick(): void {
        if (this.selectedSize) {
            this.dialogRef.close();
            this.router.navigate(['/map-editor']);
        } else {
            this.errorMessage = 'Vous devez sélectionner une taille avant de créer un jeu.';
        }
    }

    selectSize(size: string): void {
        this.selectedSize = size;
        this.errorMessage = '';
    }
}
