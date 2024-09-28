import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
    constructor(@InjectModel(Game.name) private gameModel: Model<GameDocument>) {}

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getGame(id: string): Promise<Game> {
        return await this.gameModel.findOne({ _id: id });
    }

    async addGame(game: CreateGameDto): Promise<Game> {
        try {
            return await this.gameModel.create(game);
        } catch (error) {
            throw Promise.reject(`Failed to insert map: ${error}`);
        }
    }

    async modifyGame(id: string, game: UpdateGameDto): Promise<void> {
        const filterQuery = { _id: id };
        try {
            const res = await this.gameModel.updateOne(filterQuery, game);
            if (res.matchedCount === 0) {
                throw new Error('Could not find map');
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
                return Promise.reject('Could not find game');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete game: ${error}`);
        }
    }

    async emptyDB(): Promise<void> {
        try {
            await this.gameModel.deleteMany({});
        } catch (error) {
            return Promise.reject(`Failed to delete games: ${error}`);
        }
    }
}
