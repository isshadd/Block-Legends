import { Injectable } from '@angular/core';
import { Chestplate } from '@common/classes/Items/chestplate';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { Elytra } from '@common/classes/Items/elytra';
import { EnchantedBook } from '@common/classes/Items/enchanted-book';
import { Flag } from '@common/classes/Items/flag';
import { Item } from '@common/classes/Items/item';
import { Potion } from '@common/classes/Items/potion';
import { RandomItem } from '@common/classes/Items/random-item';
import { Spawn } from '@common/classes/Items/spawn';
import { Totem } from '@common/classes/Items/totem';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { IceTile } from '@common/classes/Tiles/ice-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WallTile } from '@common/classes/Tiles/wall-tile';
import { WaterTile } from '@common/classes/Tiles/water-tile';
import { ItemType } from '@common/enums/item-type';
import { TileType } from '@common/enums/tile-type';
import { PlaceableEntity, VisibleState } from '@common/interfaces/placeable-entity';
import { Subject } from 'rxjs';

class PlaceableEntitySection {
    title: string;
    entities: PlaceableEntity[];
}

@Injectable({
    providedIn: 'root',
})
export class MapEditorSideMenuService {
    signalSideMenuMouseEnter = new Subject<PlaceableEntity>();
    signalSideMenuMouseEnter$ = this.signalSideMenuMouseEnter.asObservable();

    signalSideMenuMouseLeave = new Subject<PlaceableEntity>();
    signalSideMenuMouseLeave$ = this.signalSideMenuMouseLeave.asObservable();

    signalSideMenuMouseDown = new Subject<PlaceableEntity>();
    signalSideMenuMouseDown$ = this.signalSideMenuMouseDown.asObservable();

    private placeableEntitiesSections: PlaceableEntitySection[] = [];
    private totalItemLimitCounter: number = 0;

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
        this.totalItemLimitCounter = itemLimit;

        const itemsToUpdate = [this.sideMenuItemFinder(ItemType.Random), this.sideMenuItemFinder(ItemType.Spawn)];
        for (const item of itemsToUpdate) {
            if (item) {
                item.itemLimit = this.totalItemLimitCounter;
            }
        }
    }

    updateItemLimitCounter(item: Item, amount: number): Item | null {
        const foundItem = this.sideMenuItemFinder(item.type);
        if (!foundItem) return null;

        foundItem.itemLimit += amount;
        if (this.isNormalItem(item)) this.updateTotalItemLimitCounter(amount);

        foundItem.visibleState = foundItem.itemLimit === 0 ? VisibleState.Disabled : VisibleState.NotSelected;

        return foundItem;
    }

    updateTotalItemLimitCounter(amount: number) {
        this.totalItemLimitCounter += amount;
        const randomItem = this.sideMenuItemFinder(ItemType.Random);
        if (randomItem) {
            randomItem.itemLimit = this.totalItemLimitCounter;
        }

        if (this.totalItemLimitCounter === 0) {
            this.sideMenuItemsDisabler();
        } else {
            this.sideMenuItemsEnabler();
        }
    }

    getPlaceableEntitiesSections(): PlaceableEntitySection[] {
        return this.placeableEntitiesSections;
    }

    sideMenuTileFinder(tileType: TileType): Tile | null {
        return this.placeableEntitiesSections[0].entities.find(
            (searchedTile) => (searchedTile as Tile).type === tileType
        ) as Tile || null;
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
        return this.sideMenuTileFinder((entity as Tile).type) || this.sideMenuItemFinder((entity as Item).type);
    }

    sideMenuItemsDisabler() {
        for (const item of this.placeableEntitiesSections[1].entities) {
            if (item.visibleState === VisibleState.NotSelected && this.isNormalItem(item as Item)) {
            item.visibleState = VisibleState.Disabled;
            }
        }
    }

    sideMenuItemsEnabler() {
        this.placeableEntitiesSections[1].entities.forEach(item => {
            if ((item as Item).itemLimit > 0) {
            item.visibleState = VisibleState.NotSelected;
            }
        });
    }

    onSideMenuMouseEnter(entity: PlaceableEntity) {
        this.signalSideMenuMouseEnter.next(entity);
    }

    onSideMenuMouseLeave(entity: PlaceableEntity) {
        this.signalSideMenuMouseLeave.next(entity);
    }

    onSideMenuMouseDown(entity: PlaceableEntity) {
        this.signalSideMenuMouseDown.next(entity);
    }

    isNormalItem(item: Item): boolean {
        return item.type !== ItemType.Spawn && item.type !== ItemType.Flag;
    }
}
