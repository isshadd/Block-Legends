import { ItemType } from '@common/enums/item-type';
import { CreateItemSharedDto } from '@common/interfaces/dto/game/item-shared.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CreateItemDto implements CreateItemSharedDto {
    @ApiProperty({})
    @IsEnum(ItemType)
    type: ItemType;
}
