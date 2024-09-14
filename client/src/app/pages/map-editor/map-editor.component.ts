import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Item } from '@app/classes/Items/item';
import { BaseTile } from '@app/classes/Tiles/base-tile';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';

@Component({
    selector: 'app-map-editor',
    standalone: true,
    imports: [RouterLink, MapComponent, PlaceableEntityContainerComponent],
    templateUrl: './map-editor.component.html',
    styleUrl: './map-editor.component.scss',
})
export class MapEditorComponent {
    itemTypes: Array<Item> = [new Item(), new Item(), new Item(), new Item(), new Item(), new Item()];
    gridType: Array<BaseTile> = [new WaterTile(), new DoorTile(), new IceTile(), new WallTile(), new BaseTile()];
}
