import { Component } from '@angular/core';
/* eslint-disable max-len */
import { ItemChooseComponent } from '@app/components/item-choose/item-choose.component';
import { ItemListContainerComponent } from '@app/components/play-page-components/item-list-container/item-list-container/item-list-container.component';
import { Chestplate } from '@common/classes/Items/chestplate';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { EmptyItem } from '@common/classes/Items/empty-item';
import { Item } from '@common/classes/Items/item';
@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [ItemListContainerComponent, ItemChooseComponent],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {
    itemList: Item[] = [new EmptyItem(), new DiamondSword(), new Chestplate()];
}
