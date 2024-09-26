import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { ItemType } from '@common/enums/item-type';

@Injectable({
    providedIn: 'root',
})
export class ItemFactoryService {
    constructor() {}

    createItem(type: ItemType): Item {
        switch (type) {
            case ItemType.Item:
                return new Item();
            default:
                return new Item();
        }
    }

    copyItem(item: Item): Item {
        const newItem = this.createItem(item.type);
        newItem.coordinates = { x: item.coordinates.x, y: item.coordinates.y };
        return newItem;
    }
}
