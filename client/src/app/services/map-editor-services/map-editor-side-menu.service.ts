import { Injectable } from '@angular/core';
import { Chestplate } from '@app/classes/Items/chestplate';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { Elytra } from '@app/classes/Items/elytra';
import { EnchantedBook } from '@app/classes/Items/enchanted-book';
import { Flag } from '@app/classes/Items/flag';
import { Item } from '@app/classes/Items/item';
import { Potion } from '@app/classes/Items/potion';
import { RandomItem } from '@app/classes/Items/random-item';
import { Spawn } from '@app/classes/Items/spawn';
import { Totem } from '@app/classes/Items/totem';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { IceTile } from '@app/classes/Tiles/ice-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WallTile } from '@app/classes/Tiles/wall-tile';
import { WaterTile } from '@app/classes/Tiles/water-tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';

class PlaceableEntitySection {
    title: string;
    entities: PlaceableEntity[];
}

@Injectable({
    providedIn: 'root',
})
export class MapEditorSideMenuService {
    private placeableEntitiesSections: PlaceableEntitySection[] = [];
    private itemLimitCounter: number = 0;
    constructor() {}

    init(isGameModeCTF: boolean, itemLimit: number) {
        this.placeableEntitiesSections = [
            {
                title: 'Tuiles',
                entities: [new WaterTile(), new DoorTile(), new IceTile(), new WallTile()],
            },
            {
                title: 'Objets',
                entities: [],
            },
        ];

        this.resetItemList(isGameModeCTF, itemLimit);
    }

    resetItemList(isGameModeCTF: boolean, itemLimit: number) {
        this.placeableEntitiesSections[1] = {
            title: 'Objets',
            entities: [
                new DiamondSword(),
                new Chestplate(),
                new Elytra(),
                new EnchantedBook(),
                new Totem(),
                new Potion(),
                new Spawn(),
                new RandomItem(),
            ],
        };
        if (isGameModeCTF) {
            this.placeableEntitiesSections[1].entities.push(new Flag());
        }
        this.setItemLimit(itemLimit);
    }

    setItemLimit(itemLimit: number) {
        this.itemLimitCounter = itemLimit;

        const itemsToUpdate = [this.sideMenuItemFinder(ItemType.Random), this.sideMenuItemFinder(ItemType.Spawn)];
        for (const item of itemsToUpdate) {
            if (item) {
                item.itemLimit = this.itemLimitCounter;
            }
        }
    }

    updateItemLimitCounter(amount: number) {
        this.itemLimitCounter += amount;
        const randomItem = this.sideMenuItemFinder(ItemType.Random);
        if (randomItem) {
            randomItem.itemLimit = this.itemLimitCounter;
        }

        if (this.itemLimitCounter === 0) {
            this.sideMenuItemsDisabler();
        } else {
            this.sideMenuItemsEnabler();
        }
    }

    getPlaceableEntitiesSections(): PlaceableEntitySection[] {
        return this.placeableEntitiesSections;
    }

    sideMenuTileFinder(tileType: TileType): Tile | null {
        for (const searchedTile of this.placeableEntitiesSections[0].entities) {
            if ((searchedTile as Tile).type === tileType) {
                return searchedTile as Tile;
            }
        }
        return null;
    }

    sideMenuItemFinder(itemType: ItemType): Item | null {
        for (const searchedItem of this.placeableEntitiesSections[1].entities) {
            if ((searchedItem as Item).type === itemType) {
                return searchedItem as Item;
            }
        }
        return null;
    }

    sideMenuEntityFinder(entity: PlaceableEntity) {
        const foundTile = this.sideMenuTileFinder((entity as Tile).type) as Tile | null;
        if (foundTile) return foundTile;

        const foundItem = this.sideMenuItemFinder((entity as Item).type) as Item | null;
        if (foundItem) return foundItem;

        return null;
    }

    sideMenuItemsDisabler() {
        for (const item of this.placeableEntitiesSections[1].entities) {
            if (item.visibleState === VisibleState.NotSelected && (item as Item).type !== ItemType.Spawn) {
                item.visibleState = VisibleState.Disabled;
            }
        }
    }

    sideMenuItemsEnabler() {
        for (const item of this.placeableEntitiesSections[1].entities) {
            if ((item as Item).itemLimit > 0) {
                item.visibleState = VisibleState.NotSelected;
            }
        }
    }
}
