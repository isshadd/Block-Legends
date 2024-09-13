import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Item {
    name: String = 'Item';
    description: String = 'Item';
    imageUrl: String = 'assets/images/items/Sword.png';
    constructor() {}
}
