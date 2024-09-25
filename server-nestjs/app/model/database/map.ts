import { MapShared } from '@common/interfaces/map-shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Tile } from '../schema/tile.schema';

export type MapDocument = Map & Document;

@Schema()
export class Map implements MapShared {
    @ApiProperty({})
    @Prop({ required: true })
    name: string;

    @ApiProperty({})
    @Prop({ required: true })
    description: string;

    @ApiProperty({})
    @Prop({ required: true })
    size: number;

    @ApiProperty({})
    @Prop({ required: true })
    tiles: Tile[][];
}

export const MapSchema = SchemaFactory.createForClass(Map);
