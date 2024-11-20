import { Component, Input } from '@angular/core';
import { Item } from '@common/classes/Items/item';

@Component({
    selector: 'app-item-info',
    standalone: true,
    imports: [],
    templateUrl: './item-info.component.html',
    styleUrl: './item-info.component.scss',
})
export class ItemInfoComponent {
    @Input() item: Item;
}
