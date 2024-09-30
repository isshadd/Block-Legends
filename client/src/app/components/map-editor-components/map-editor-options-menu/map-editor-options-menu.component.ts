import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameShared } from '@common/interfaces/game-shared';
import { ButtonNotificationComponent, ButtonNotificationState } from '../button-notification/button-notification.component';
import { MapEditorModalComponent } from '../map-editor-modal/map-editor-modal.component';

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

    optionsNotificationDescription = '';
    saveNotificationDescription = '';

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
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
            this.optionsNotificationDescription = 'Il faut donner un nom et une description à la carte';
            return ButtonNotificationState.ALERT;
        } else {
            this.optionsNotificationDescription = '';
            return ButtonNotificationState.HIDDEN;
        }
    }

    getSaveNotificationState(): ButtonNotificationState {
        if (!this.gameMapDataManagerService.isSavedGame()) {
            this.saveNotificationDescription = "La carte n'est pas sauvegardée";
            return ButtonNotificationState.ALERT;
        }
        if (this.gameMapDataManagerService.isGameUpdated) {
            this.saveNotificationDescription = 'La carte a été modifiée';
            return ButtonNotificationState.WARNING;
        }
        this.saveNotificationDescription = 'La carte est sauvegardée';
        return ButtonNotificationState.SUCCESS;
    }
}
