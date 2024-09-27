import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { MapShared } from '@common/interfaces/map-shared';
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
            data: this.mapEditorManagerService.map,
        });

        dialogRef.afterClosed().subscribe((result: MapShared) => {
            if (result) {
                this.mapEditorManagerService.map.name = result.name;
                this.mapEditorManagerService.map.description = result.description;
            }
        });
    }

    onResetClick() {
        this.mapEditorManagerService.resetMap();
    }

    onSaveClick() {
        this.mapEditorManagerService.saveMap();
    }
}
