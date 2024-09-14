import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { PlaceableEntityFullMenuComponent } from '@app/components/map-editor-components/placeable-entity-full-menu/placeable-entity-full-menu.component';

@Component({
    selector: 'app-map-editor',
    standalone: true,
    imports: [RouterLink, MapComponent, PlaceableEntityFullMenuComponent],
    templateUrl: './map-editor.component.html',
    styleUrl: './map-editor.component.scss',
})
export class MapEditorComponent {}
