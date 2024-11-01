import { Component, Input } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { TileType } from '@common/enums/tile-type';

@Component({
  selector: 'app-map-tile-info',
  standalone: true,
  imports: [],
  templateUrl: './map-tile-info.component.html',
  styleUrl: './map-tile-info.component.scss'
})
export class MapTileInfoComponent {
  @Input() tile: Tile;

  tileTypeToImage(tileType: TileType): string {
    return `/assets/images/tiles/blocks/${tileType}.png`;
  }
}
