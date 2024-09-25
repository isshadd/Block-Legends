import { ItemShared } from '@common/interfaces/item-shared';
import { Prop, Schema } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ _id: false })
export class Item implements ItemShared {
    @ApiProperty({})
    @Prop({ required: true })
    name: string;
}

export type ItemDocument = Item;
