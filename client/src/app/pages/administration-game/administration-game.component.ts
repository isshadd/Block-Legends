import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
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
export class AdministrationGameComponent {}
