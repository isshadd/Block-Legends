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
import { ItemType } from '@common/enums/item-type';

@Injectable({
    providedIn: 'root',
})
export class ItemFactoryService {
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
            case ItemType.Random:
                return new RandomItem();
            default:
                return new Item();
        }
    }

    copyItem(item: Item): Item {
        const newItem = this.createItem(item.type);
        newItem.setCoordinates(item.coordinates);
        newItem.itemLimit = item.itemLimit;
        return newItem;
    }
}
