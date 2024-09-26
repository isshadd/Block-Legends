import { Component } from '@angular/core';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
// eslint-disable-next-line max-len
import { Chestplate } from '@app/classes/Items/chestplate';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { Elytra } from '@app/classes/Items/elytra';
import { EnchantedBook } from '@app/classes/Items/enchanted-book';
import { Flag } from '@app/classes/Items/flag';
import { Potion } from '@app/classes/Items/potion';
import { Totem } from '@app/classes/Items/totem';
import { PlaceableEntityContainerComponent } from '@app/components/map-editor-components/placeable-entity-container/placeable-entity-container.component';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';

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
            entities: [new DiamondSword(), new Chestplate(), new Elytra(), new EnchantedBook(), new Totem(), new Potion(), new Flag()],
        },
    ];
}
class PlaceableEntitySection {
    title: string;
    entities: PlaceableEntity[];
}
