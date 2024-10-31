import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GameValidationService } from '@app/services/game-validation/gameValidation.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name)
        private gameModel: Model<GameDocument>,
        @Inject(forwardRef(() => GameValidationService))
        private gameValidationService: GameValidationService,
    ) {}

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getGame(id: string): Promise<Game> {
        return await this.gameModel.findOne({ _id: id });
    }

    async getGameByName(name: string): Promise<Game | null> {
        const normalizedName = name.trim().replace(/\s+/g, ' ');

        return await this.gameModel.findOne({ name: { $regex: new RegExp('^' + normalizedName + '$', 'i') } });
    }

    async addGame(game: CreateGameDto): Promise<Game> {
        const gameToValidate = game as Game;
        const validationResult = await this.gameValidationService.validateGame(gameToValidate);
        if (!validationResult.isValid) {
            throw new Error(`Veuillez corriger les erreurs suivantes avant de pouvoir continuer: ${validationResult.errors.join('<br>')}`);
        }

        try {
            return await this.gameModel.create(game);
        } catch (error) {
            throw new Error(`Failed to insert game: ${error}`);
        }
    }

    async modifyGame(id: string, game: UpdateGameDto): Promise<void> {
        // Validate the game data
        const validationResult = await this.gameValidationService.validateGame(game);
        if (!validationResult.isValid) {
            throw new Error(`Veuillez corriger les erreurs suivantes avant de pouvoir continuer: ${validationResult.errors.join('<br>')}`);
        }

        const filterQuery = { _id: id };
        try {
            const res = await this.gameModel.updateOne(filterQuery, game);
            if (res.matchedCount === 0) {
                throw new Error('Could not find game');
            }
        } catch (error) {
            throw new Error(`Failed to update document: ${error}`);
        }
    }

    async deleteGame(id: string): Promise<void> {
        try {
            const res = await this.gameModel.deleteOne({
                _id: id,
            });
            if (res.deletedCount === 0) {
                throw new Error('Could not find game');
            }
        } catch (error) {
            throw new Error(`Failed to delete game: ${error}`);
        }
    }

    async emptyDB(): Promise<void> {
        try {
            await this.gameModel.deleteMany({});
        } catch (error) {
            throw new Error(`Failed to delete games: ${error}`);
        }
    }
}
