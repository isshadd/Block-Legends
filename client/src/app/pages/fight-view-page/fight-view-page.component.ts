import { Component } from '@angular/core';
import { ItemListContainerComponent } from '@app/components/play-page-components/item-list-container/item-list-container/item-list-container.component';
import { Chestplate } from '@common/classes/Items/chestplate';
import { DiamondSword } from '@common/classes/Items/diamond-sword';
import { Elytra } from '@common/classes/Items/elytra';
import { EmptyItem } from '@common/classes/Items/empty-item';
import { EnchantedBook } from '@common/classes/Items/enchanted-book';
import { Flag } from '@common/classes/Items/flag';
import { Item } from '@common/classes/Items/item';
import { Potion } from '@common/classes/Items/potion';
import { RandomItem } from '@common/classes/Items/random-item';
import { Spawn } from '@common/classes/Items/spawn';
import { Totem } from '@common/classes/Items/totem';
@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [ItemListContainerComponent],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {
    itemList: Item[] = [
        new EmptyItem(),
        new DiamondSword(),
        new Chestplate(),
        new Elytra(),
        new EnchantedBook(),
        new Flag(),
        new Potion(),
        new RandomItem(),
        new Spawn(),
        new Totem(),
    ];
}
