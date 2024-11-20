import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { CreateGameModalComponent } from '@app/components/administration-page-component/creatGameModal/createGameModal.component';
import { ListGameComponent } from '@app/components/administration-page-component/listGame.component';

@Component({
    selector: 'app-administration-game',
    standalone: true,
    imports: [CommonModule, RouterLink, ListGameComponent],
    templateUrl: './administration-game.component.html',
    styleUrls: ['./administration-game.component.scss'],
})
export class AdministrationGameComponent {
    fileList: File[] = [];
    constructor(public dialog: MatDialog) {}

    openCreateGameModal(): void {
        this.dialog.open(CreateGameModalComponent);
    }

    triggerFileInput(): void {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.fileList = Array.from(input.files);
            console.log('Fichiers sélectionnés :', this.fileList);
        }
    }
}
