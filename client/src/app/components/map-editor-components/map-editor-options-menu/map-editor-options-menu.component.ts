import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
    ButtonNotificationComponent,
    ButtonNotificationState,
} from '@app/components/map-editor-components/button-notification/button-notification.component';
import { MapEditorModalComponent } from '@app/components/map-editor-components/map-editor-modal/map-editor-modal.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { GameShared } from '@common/interfaces/game-shared';

@Component({
    selector: 'app-map-editor-options-menu',
    standalone: true,
    imports: [MatIconModule, ButtonNotificationComponent, MatTooltip],
    templateUrl: './map-editor-options-menu.component.html',
    styleUrl: './map-editor-options-menu.component.scss',
})
export class MapEditorOptionsMenuComponent {
    optionsNotificationState = ButtonNotificationState.HIDDEN;
    saveNotificationState = ButtonNotificationState.HIDDEN;

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public mapEditorManagerService: MapEditorManagerService,
        public modal: MatDialog,
    ) {}

    onOptionsClick() {
        const dialogRef = this.modal.open(MapEditorModalComponent, {
            data: { name: this.gameMapDataManagerService.currentName, description: this.gameMapDataManagerService.currentDescription },
        });

        dialogRef.afterClosed().subscribe((result: GameShared) => {
            if (result) {
                this.gameMapDataManagerService.currentName = result.name;
                this.gameMapDataManagerService.currentDescription = result.description;
                this.gameMapDataManagerService.isGameUpdated = true;
            }
        });
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
        this.gameMapDataManagerService.save();
    }

    getOptionsNotificationState(): ButtonNotificationState {
        if (!this.gameMapDataManagerService.hasValidNameAndDescription()) {
            return ButtonNotificationState.ALERT;
        } else {
            return ButtonNotificationState.HIDDEN;
        }
    }

    getOptionsNotificationDescription(): string {
        if (!this.gameMapDataManagerService.hasValidNameAndDescription()) {
            return 'Il faut donner un nom et une description à la carte';
        } else {
            return '';
        }
    }

    getSaveNotificationState(): ButtonNotificationState {
        if (!this.gameMapDataManagerService.isSavedGame()) {
            return ButtonNotificationState.ALERT;
        } else if (this.gameMapDataManagerService.isGameUpdated) {
            return ButtonNotificationState.WARNING;
        }
        return ButtonNotificationState.SUCCESS;
    }

    getSaveNotificationDescription(): string {
        if (!this.gameMapDataManagerService.isSavedGame()) {
            return "La carte n'est pas sauvegardée";
        } else if (this.gameMapDataManagerService.isGameUpdated) {
            return 'La carte a été modifiée';
        }
        return 'La carte est sauvegardée';
    }
}
