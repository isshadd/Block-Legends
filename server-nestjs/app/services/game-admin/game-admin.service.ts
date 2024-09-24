import { Injectable, Logger } from '@nestjs/common';
import { Message } from '@common/message';
import { InjectModel } from '@nestjs/mongoose';
import {Game, GameDocument} from '@app/model/database/game';
import { FilterQuery, Model } from 'mongoose';


@Injectable()
export class GameAdminService {
    clientMessages: Message[] = [];
    constructor(
        @InjectModel(Game.name) private gameModel: Model<GameDocument>,
        private readonly logger: Logger,
    ){
        this.clientMessages = [];
        this.start();
    }

    async start() {
        if((await this.gameModel.countDocuments()) === 0){
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        const games: Game[] = [
        {
            name: 'League Of Legends',
            size: 30,
            mode: 'CTF',
            imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
        },
        {
            name: 'Minecraft',
            size: 38,
            mode: 'Normal',
            imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            lastModificationDate: new Date('2020-01-03'),
            isVisible: true,
        },
        {
            name: 'Penguin Diner',
            size: 25,
            mode: 'Normal',
            imageUrl: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
            lastModificationDate: new Date('2005-12-12'),
            isVisible: true,
        },
        {   
            name: 'Super Mario',
            size: 36,
            mode: 'CTF',
            imageUrl: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            lastModificationDate: new Date('2010-06-01'),
            isVisible: true,
        }
        ];

        await this.gameModel.insertMany(games);
        
    }

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async deleteGame(gameName: string): Promise<void> {
        try{
            const res = await this.gameModel.deleteOne({
                name: gameName,
        });
        if(res.deletedCount === 0){
            return Promise.reject("Could not find game");
        }
        } catch (error) {
            return Promise.reject(`Failed to delete game: ${error}`);
        }
    }   

    async emptyDB(): Promise<void> {
        try{
            await this.gameModel.deleteMany({});
        } catch (error) {
            return Promise.reject(`Failed to delete games: ${error}`);
        }
    }
}
