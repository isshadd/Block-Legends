import { Injectable } from '@angular/core';
import { TileType } from '@common/enums/tile-type';
import { WalkableTile } from './walkable-tile';

@Injectable({
    providedIn: 'root',
})
export class OpenDoor extends WalkableTile {
    type: TileType = TileType.OpenDoor;
    description: string = 'Porte ouverte. Vous pouvez maintenant la franchir.';
    imageUrl: string = 'assets/images/tiles/open-door.png';

    isDoor(): boolean {
        return true;
    }
}
