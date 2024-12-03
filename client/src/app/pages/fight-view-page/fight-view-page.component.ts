import { Component } from '@angular/core';
/* eslint-disable max-len */ // This line is necessary for the import of FightViewPageComponent and it is impossible to refactor the address
import { ItemChooseComponent } from '@app/components/item-choose/item-choose.component';
import { Chestplate } from '@common/classes/Items/chestplate';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { EmptyItem } from '@common/classes/Items/empty-item';
import { Item } from '@common/classes/Items/item';
@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [ItemChooseComponent],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {
    itemList: Item[] = [new EmptyItem(), new DiamondSword(), new Chestplate()];
}
