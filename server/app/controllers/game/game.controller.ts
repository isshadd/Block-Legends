import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Games')
@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
        private readonly gameValidationService: GameValidationService,
    ) {}

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
            const allGames = await this.gameService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get Game by id',
        type: Game,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id')
    async findMap(@Param('id') id: string, @Res() response: Response) {
        try {
            const map = await this.gameService.getGame(id);
            response.status(HttpStatus.OK).json(map);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new game',
        type: Game,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async create(@Body() createGameDto: CreateGameDto, @Res() response: Response) {
        try {
            // const validationResult = await this.gameValidationService.validateGame(createGameDto);
            // if (!validationResult.isValid) {
            //     return response.status(HttpStatus.BAD_REQUEST).json({ errors: validationResult.errors });
            // }

            const newGame: Game = await this.gameService.addGame(createGameDto);
            response.status(HttpStatus.CREATED).json(newGame);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
            // this.openModal(error.message);
        }
    }
    @ApiOkResponse({
        description: 'Modify a game',
        type: Game,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Patch('/:id')
    async patchGame(@Param('id') id: string, @Body() gameDto: UpdateGameDto, @Res() response: Response) {
        try {
            // const isOnlyIsVisibleModified = Object.keys(gameDto).length === 1 && 'isVisible' in gameDto;
            // if (!isOnlyIsVisibleModified) {
            //     const validationResult = await this.gameValidationService.validateGame(gameDto);
            //     if (!validationResult.isValid) {
            //         return response.status(HttpStatus.BAD_REQUEST).json(validationResult.errors.join('\n'));
            //     }
            // }

            await this.gameService.modifyGame(id, gameDto);
            response.status(HttpStatus.OK).send();
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
    @Delete('/:id')
    async deleteGame(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gameService.deleteGame(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Empty the database',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/')
    async emptyDatabase(@Res() response: Response) {
        try {
            await this.gameService.emptyDB();
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
