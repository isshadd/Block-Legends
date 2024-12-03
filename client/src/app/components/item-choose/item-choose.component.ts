import { Component, EventEmitter, Input, Output } from '@angular/core';
/* eslint-disable max-len */ // This line is necessary for the ItemChooseComponent to work and should not be refactored. We have to disable max-len
import { ItemListContainerComponent } from '@app/components/play-page-components/item-list-container/item-list-container/item-list-container.component';
import { Item } from '@common/classes/Items/item';

@Component({
    selector: 'app-item-choose',
    standalone: true,
    imports: [ItemListContainerComponent],
    templateUrl: './item-choose.component.html',
    styleUrl: './item-choose.component.scss',
})
export class ItemChooseComponent {
    @Input() containerItems: Item[] | undefined;
    @Output() itemClicked: EventEmitter<Item> = new EventEmitter<Item>();

    itemClickedHandler(item: Item) {
        this.itemClicked.emit(item);
    }
}
