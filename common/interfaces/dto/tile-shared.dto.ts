import { CreateItemSharedDto } from './item-shared.dto';

export class CreateTileSharedDto {
    name: string;
    item?: CreateItemSharedDto;
}
