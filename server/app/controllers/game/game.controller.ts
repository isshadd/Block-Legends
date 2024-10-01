import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
import { GameService } from '@app/services/game/game.service';
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
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
            const validationResult = await this.gameValidationService.validateGame(createGameDto);
            if (!validationResult.isValid) {
                return response.status(HttpStatus.BAD_REQUEST).send(validationResult.errors.join('\n'));
            }
            const isTilesValid = await this.gameValidationService.isMapTilesValid(createGameDto, createGameDto.size);
            if (!isTilesValid) {
                return response
                    .status(HttpStatus.BAD_REQUEST)
                    .send('Plus de 50 % de la carte doit être composée de tuiles de type Grass, Water ou Ice.');
            }

            const newGame: Game = await this.gameService.addGame(createGameDto);
            response.status(HttpStatus.CREATED).json(newGame);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
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
            const existingGame = await this.gameService.getGame(id);
            const updatedGame: Game = { ...existingGame, ...gameDto };
            const isTilesValid = await this.gameValidationService.isMapTilesValid(updatedGame, existingGame.size);
            if (!isTilesValid) {
                return response
                    .status(HttpStatus.BAD_REQUEST)
                    .send('Plus de 50 % de la carte doit être composée de tuiles de type Grass, Water ou Ice.');
            }
            const validationResult = await this.gameValidationService.validateGame(updatedGame);
            if (!validationResult.isValid) {
                return response.status(HttpStatus.BAD_REQUEST).send(validationResult.errors.join('\n'));
            }
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

    @ApiOkResponse({
        description: 'Validates the game depending on the number of spawn points',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id/isValidSizeBySpawnPoints')
    async isValidSizeBySpawnPoints(@Param('id') id: string, @Res() response: Response) {
        try {
            const isValid = await this.gameValidationService.isValidSizeBySpawnPoints(id);
            response.status(HttpStatus.OK).json(isValid);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Generates matrix of 1 and 0',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id/Matrix')
    async mapToMatrix(@Param('id') id: string, @Res() response: Response) {
        try {
            const matrix = await this.gameValidationService.mapToMatrix(id);
            response.status(HttpStatus.OK).json(matrix);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Map validation',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/:id/MapValidation')
    async mapIsValid(@Param('id') id: string, @Res() response: Response) {
        try {
            const matrix = await this.gameValidationService.mapIsValid(id);
            response.status(HttpStatus.OK).json(matrix);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
    

}
