import { Component } from '@angular/core';
// This line is necessary for the PlaceableEntityFullMenuComponent to work and should not be refactored. We have to disable max-len
// eslint-disable-next-line max-len
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';
import { MapEditorSideMenuService } from '@app/services/map-editor-services/map-editor-side-menu/map-editor-side-menu.service';

@Component({
    selector: 'app-placeable-entity-full-menu',
    standalone: true,
    imports: [PlaceableEntityContainerComponent],
    templateUrl: './placeable-entity-full-menu.component.html',
    styleUrl: './placeable-entity-full-menu.component.scss',
})
export class PlaceableEntityFullMenuComponent {
    constructor(public sideMenuService: MapEditorSideMenuService) {}
}
