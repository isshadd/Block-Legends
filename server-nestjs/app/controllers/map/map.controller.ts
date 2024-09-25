import { Map } from '@app/model/database/map';
import { CreateMapDto } from '@app/model/dto/map/map.dto';
import { MapService } from '@app/services/map/map.service';
import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Maps')
@Controller('map')
export class MapController {
    constructor(private readonly mapsService: MapService) {}

    @ApiOkResponse({
        description: 'Returns all maps',
        type: Map,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allMaps(@Res() response: Response) {
        try {
            const allMaps = await this.mapsService.getAllMaps();
            response.status(HttpStatus.OK).json(allMaps);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get Map by id',
        type: Map,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id')
    async findMap(@Param('id') id: string, @Res() response: Response) {
        try {
            const map = await this.mapsService.getMap(id);
            response.status(HttpStatus.OK).json(map);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new map',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async create(@Body() createMapDto: CreateMapDto, @Res() response: Response) {
        try {
            await this.mapsService.addMap(createMapDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
