import { Component, Input } from '@angular/core';
import { BaseTile } from '@app/classes/Tiles/base-tile';

@Component({
    selector: 'app-tile-component',
    standalone: true,
    imports: [],
    templateUrl: './tile.component.html',
    styleUrl: './tile.component.scss',
})
export class TileComponent {
    @Input() tile: BaseTile;
}
