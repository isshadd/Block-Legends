import { TileType } from '../../../enums/tile-type';
import { CreateItemSharedDto } from './item-shared.dto';

export class CreateTileSharedDto {
    type: TileType;
    item?: CreateItemSharedDto;
}
