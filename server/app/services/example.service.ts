import { DateService } from '@app/services/date.service';
import { Message } from '@common/message';
import { MongoClient } from 'mongodb';
import { Service } from 'typedi';

@Service()
export class ExampleService {
    clientMessages: Message[];
    constructor(private readonly dateService: DateService) {
        this.clientMessages = [];
    }

    about(): Message {
        return {
            title: 'Basic Server About Page',
            body: 'Try calling /api/docs to get the documentation',
        };
    }

    async helloWorld(): Promise<Message> {
        return this.dateService
            .currentTime()
            .then((timeMessage: Message) => {
                return {
                    title: 'YOOOOOOOO',
                    body: 'Time is ' + timeMessage.body,
                };
            })
            .catch((error: unknown) => {
                return {
                    title: 'Error',
                    body: error as string,
                };
            });
    }


    async populateDatabase(): Promise<void> {
        const uri = 'mongodb+srv://nicolasbilodeau:MphdHKkRMAlolEyp@cluster0.rrbzp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        const client = new MongoClient(uri);

        const games = [
            {
                name: 'League Of Legends',
                size: 30,
                mode: 'CTF',
                imgSrc: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
                lastModif: new Date('2024-10-23'),
                isVisible: true,
            },
            {
                name: 'Minecraft',
                size: 38,
                mode: 'Normal',
                imgSrc: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
                lastModif: new Date('2020-01-03'),
                isVisible: true,
            },
            {
                name: 'Penguin Diner',
                size: 25,
                mode: 'Normal',
                imgSrc: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
                lastModif: new Date('2005-12-12'),
                isVisible: true,
            },
            {
                name: 'Super Mario',
                size: 36,
                mode: 'CTF',
                imgSrc: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
                lastModif: new Date('2010-06-01'),
                isVisible: true,
            },
            // Add more game objects here if needed
        ];

        try {
            await client.connect();
            const database = client.db('LOG2990_104_Nicolas');
            const collection = database.collection('Games');
            await collection.insertMany(games);
        } catch (error) {
            throw new Error('Failed to populate database: ' + (error as string));
        } finally {
            await client.close();
        }
    }
    async emptyDatabase(): Promise<void> {
        const uri = 'mongodb+srv://nicolasbilodeau:MphdHKkRMAlolEyp@cluster0.rrbzp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        const client = new MongoClient(uri);

        try {
            await client.connect();
            const database = client.db('LOG2990_104_Nicolas');
            const collection = database.collection('Games');
            await collection.deleteMany({});
        } catch (error) {
            throw new Error('Failed to empty database: ' + (error as string));
        } finally {
            await client.close();
        }
    }
    
    async deleteGame(gameName: string): Promise<void> {
        const uri = 'mongodb+srv://nicolasbilodeau:MphdHKkRMAlolEyp@cluster0.rrbzp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
        const client = new MongoClient(uri);
    
        try {
            await client.connect();
            const database = client.db('LOG2990_104_Nicolas');
            const collection = database.collection('Games');
            await collection.deleteOne({name: gameName});
        } catch (error) {
            throw new Error('Failed to delete game: ' + (error as string));
        } finally {
            await client.close();
        }
    }
    // TODO : ceci est à titre d'exemple. À enlever pour la remise
    storeMessage(message: Message): void {
        // eslint-disable-next-line no-console
        console.log(message);
        this.clientMessages.push(message);
    }

    getAllMessages(): Message[] {
        return this.clientMessages;
    }
}
