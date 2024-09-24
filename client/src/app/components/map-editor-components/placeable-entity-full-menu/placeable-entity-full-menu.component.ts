import { Component } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
// eslint-disable-next-line max-len
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';
import { PlaceableEntity } from '@common/placeable-entity';

@Component({
    selector: 'app-placeable-entity-full-menu',
    standalone: true,
    imports: [PlaceableEntityContainerComponent],
    templateUrl: './placeable-entity-full-menu.component.html',
    styleUrl: './placeable-entity-full-menu.component.scss',
})
export class PlaceableEntityFullMenuComponent {
    placeableEntitiesSections: PlaceableEntitySection[] = [
        {
            title: 'Tuiles',
            entities: [new WaterTile(), new DoorTile(), new IceTile(), new WallTile()],
        },
        {
            title: 'Objets',
            entities: [new Item(), new Item(), new Item(), new Item(), new Item(), new Item()],
        },
    ];
}
class PlaceableEntitySection {
    title: string;
    entities: PlaceableEntity[];
}
