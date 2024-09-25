import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Item } from './item.schema';

@Schema({ _id: false })
export class Tile {
    @ApiProperty({})
    @Prop({ required: true })
    name: string;

    @ApiProperty({})
    @Prop({ type: Item, required: false, default: null })
    item?: Item;
}

export type TileDocument = Tile;
