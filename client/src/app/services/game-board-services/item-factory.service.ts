import { Injectable } from '@angular/core';
import { Chestplate } from '@app/classes/Items/chestplate';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { Elytra } from '@app/classes/Items/elytra';
import { EnchantedBook } from '@app/classes/Items/enchanted-book';
import { Flag } from '@app/classes/Items/flag';
import { Item } from '@app/classes/Items/item';
import { Potion } from '@app/classes/Items/potion';
import { Spawn } from '@app/classes/Items/spawn';
import { Totem } from '@app/classes/Items/totem';
import { ItemType } from '@common/enums/item-type';

@Injectable({
    providedIn: 'root',
})
export class ItemFactoryService {
    constructor() {}

    createItem(type: ItemType): Item {
        switch (type) {
            case ItemType.Sword:
                return new DiamondSword();
            case ItemType.Elytra:
                return new Elytra();
            case ItemType.Totem:
                return new Totem();
            case ItemType.Potion:
                return new Potion();
            case ItemType.EnchantedBook:
                return new EnchantedBook();
            case ItemType.Chestplate:
                return new Chestplate();
            case ItemType.Flag:
                return new Flag();
            case ItemType.Spawn:
                return new Spawn();
            default:
                return new Item();
        }
    }

    copyItem(item: Item): Item {
        const newItem = this.createItem(item.type);
        newItem.coordinates = { x: item.coordinates.x, y: item.coordinates.y };
        newItem.itemLimit = item.itemLimit;
        return newItem;
    }
}
