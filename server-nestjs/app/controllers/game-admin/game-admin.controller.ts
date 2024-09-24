import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {GameAdminService} from '@app/services/game-admin/game-admin.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { Game } from '@app/model/database/game';


@ApiTags('Games')
@Controller('game-admin')
export class GameAdminController {
    constructor(private readonly gameAdminService: GameAdminService) {}

    @ApiOkResponse({
        description: 'Returns all games',
        type: Game,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allGames(@Res() response: Response) {
        try {
            const allGames = await this.gameAdminService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    } 

    @ApiOkResponse({
        description: 'Delete a game',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:name')
    async deleteGame(@Param('name') name: string, @Res() response: Response) {
        try {
            await this.gameAdminService.deleteGame(name);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: "Empty the database",
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/')
    async emptyDatabase(@Res() response: Response) {
        try {
            await this.gameAdminService.emptyDB();
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
    

}
