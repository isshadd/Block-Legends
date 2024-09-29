import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameShared } from '@common/interfaces/game-shared';
import { MapEditorModalComponent } from '../map-editor-modal/map-editor-modal.component';

@Component({
    selector: 'app-map-editor-options-menu',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './map-editor-options-menu.component.html',
    styleUrl: './map-editor-options-menu.component.scss',
})
export class MapEditorOptionsMenuComponent {
    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public modal: MatDialog,
    ) {}

    onOptionsClick() {
        const dialogRef = this.modal.open(MapEditorModalComponent, {
            width: '400px',
            data: this.gameMapDataManagerService.game,
        });

        dialogRef.afterClosed().subscribe((result: GameShared) => {
            if (result) {
                this.gameMapDataManagerService.game.name = result.name;
                this.gameMapDataManagerService.game.description = result.description;
            }
        });
    }

    onResetClick() {
        this.gameMapDataManagerService.resetGame();
    }

    onSaveClick() {
        this.gameMapDataManagerService.saveMap();
    }
}
