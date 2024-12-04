import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MapEditorModalComponent } from '@app/components/map-editor-components/map-editor-modal/map-editor-modal.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager/map-editor-manager.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-map-editor-options-menu',
    standalone: true,
    imports: [MatIconModule, MatTooltip],
    templateUrl: './map-editor-options-menu.component.html',
    styleUrl: './map-editor-options-menu.component.scss',
})
export class MapEditorOptionsMenuComponent implements OnDestroy {
    private subscriptions: Subscription = new Subscription();

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public mapEditorManagerService: MapEditorManagerService,
        public modal: MatDialog,
    ) {}

    onOptionsClick() {
        const dialogRef = this.modal.open(MapEditorModalComponent, {
            data: { name: this.gameMapDataManagerService.currentName, description: this.gameMapDataManagerService.currentDescription },
        });

        this.subscriptions.add(
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this.gameMapDataManagerService.currentName = result.name;
                    this.gameMapDataManagerService.currentDescription = result.description;
                    if (result.isSavedPressed) {
                        this.onSaveClick();
                    }
                }
            }),
        );
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onResetClick() {
        this.gameMapDataManagerService.resetGame();
        this.mapEditorManagerService.itemCheckup();
    }

    onSaveClick() {
        if (!this.gameMapDataManagerService.hasValidNameAndDescription()) {
            this.onOptionsClick();
            return;
        }
        this.gameMapDataManagerService.saveGame();
    }
}
