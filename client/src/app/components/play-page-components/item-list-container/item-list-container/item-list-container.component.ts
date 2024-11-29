import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';
import { EmptyItem } from '@common/classes/Items/empty-item';
import { Item } from '@common/classes/Items/item';
import { VisibleState } from '@common/interfaces/placeable-entity';

@Component({
    selector: 'app-item-list-container',
    standalone: true,
    imports: [PlaceableEntityComponent, MatTooltipModule, VisibleStateComponent],
    templateUrl: './item-list-container.component.html',
    styleUrl: './item-list-container.component.scss',
})
export class ItemListContainerComponent {
    @Input() containerItems: Item[] | undefined;
    @Output() itemClicked: EventEmitter<Item> = new EventEmitter<Item>();

    emptySlot = new EmptyItem();

    onMouseEnter(item: Item) {
        item.visibleState = VisibleState.Hovered;
    }

    onMouseLeave(item: Item) {
        item.visibleState = VisibleState.NotSelected;
    }

    onMouseDown(event: MouseEvent, item: Item) {
        if (event.button === 2) return;

        this.itemClicked.emit(item);
        event.preventDefault();
    }
}
