import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';

@Component({
    selector: 'app-map-editor-options-menu',
    standalone: true,
    imports: [MatIconModule],
    templateUrl: './map-editor-options-menu.component.html',
    styleUrl: './map-editor-options-menu.component.scss',
})
export class MapEditorOptionsMenuComponent {
    constructor(public mapEditorManagerService: MapEditorManagerService) {}

    onResetClick() {
        this.mapEditorManagerService.resetMap();
    }

    onSaveClick() {
        this.mapEditorManagerService.saveMap();
    }
}
