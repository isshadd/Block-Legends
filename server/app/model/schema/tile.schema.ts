import { TileType } from '@common/enums/tile-type';
import { TileShared } from '@common/interfaces/tile-shared';
import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Item } from './item.schema';

@Schema({ _id: false })
export class Tile implements TileShared {
    @ApiProperty({})
    @Prop({ required: true })
    type: TileType;

    @ApiProperty({})
    @Prop({ type: Item, required: false, default: null })
    item?: Item;
}

export type TileDocument = Tile;
