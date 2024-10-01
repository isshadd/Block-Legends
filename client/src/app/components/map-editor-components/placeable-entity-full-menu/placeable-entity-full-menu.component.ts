import { Component } from '@angular/core';
// eslint-disable-next-line max-len
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';

@Component({
    selector: 'app-placeable-entity-full-menu',
    standalone: true,
    imports: [PlaceableEntityContainerComponent],
    templateUrl: './placeable-entity-full-menu.component.html',
    styleUrl: './placeable-entity-full-menu.component.scss',
})
export class PlaceableEntityFullMenuComponent {
    constructor(public mapEditorManagerService: MapEditorManagerService) {}
}
