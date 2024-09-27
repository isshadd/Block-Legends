import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { CreateGameModalComponent } from '@app/components/administration-page-component/creatGameModal/createGameModal.component';
import { ListGameComponent } from '@app/components/administration-page-component/listGame.component';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';

@Component({
    selector: 'app-administration-game',
    standalone: true,
    imports: [CommonModule, RouterLink, ListGameComponent],
    providers: [AdministrationPageManagerService],
    templateUrl: './administration-game.component.html',
    styleUrl: './administration-game.component.scss',
})
export class AdministrationGameComponent {
    constructor(public dialog: MatDialog) {}

    openCreateGameModal(): void {
        this.dialog.open(CreateGameModalComponent, {
            width: '700px',
            height: '400px',
        });
    }
}
