import { CreateTileSharedDto } from './tile-shared.dto';

export class CreateMapSharedDto {
    name: string;
    description: string;
    size: number;
    tiles: CreateTileSharedDto[][];
}
