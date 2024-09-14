import { Component, Input } from '@angular/core';
import { Item } from '@app/classes/Items/item';

@Component({
    selector: 'app-item',
    standalone: true,
    imports: [],
    templateUrl: './item.component.html',
    styleUrl: './item.component.scss',
})
export class ItemComponent {
    @Input() item: Item;
}
