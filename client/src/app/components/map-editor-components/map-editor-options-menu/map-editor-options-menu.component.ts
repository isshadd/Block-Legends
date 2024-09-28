import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
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
        public mapEditorManagerService: MapEditorManagerService,
        public modal: MatDialog,
    ) {}

    onOptionsClick() {
        const dialogRef = this.modal.open(MapEditorModalComponent, {
            width: '400px',
            data: this.mapEditorManagerService.game,
        });

        dialogRef.afterClosed().subscribe((result: GameShared) => {
            if (result) {
                this.mapEditorManagerService.game.name = result.name;
                this.mapEditorManagerService.game.description = result.description;
            }
        });
    }

    onResetClick() {
        this.mapEditorManagerService.resetGame();
    }

    onSaveClick() {
        this.mapEditorManagerService.saveMap();
    }
}
