import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { Tile } from '../schema/tile.schema';

export type GameDocument = Game & Document;

@Schema()
export class Game implements GameShared {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @Prop({ required: true })
    size: MapSize;

    @ApiProperty()
    @Prop({ required: true })
    mode: GameMode;

    @ApiProperty()
    @Prop({ required: true })
    imageUrl: string;

    @ApiProperty()
    @Prop({ required: true })
    lastModificationDate: Date;

    @ApiProperty()
    @Prop({ required: true })
    isVisible: boolean;

    @ApiProperty()
    @Prop({ required: true })
    tiles: Tile[][];
}

export const gameSchema = SchemaFactory.createForClass(Game);
