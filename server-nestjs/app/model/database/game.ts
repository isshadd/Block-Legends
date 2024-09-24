import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    size: number;

    @ApiProperty()
    @Prop({ required: true })
    mode: string;

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
    _id?: string;
}

export const gameSchema = SchemaFactory.createForClass(Game);