import { ExampleService } from '@app/services/example.service';
import { Message } from '@common/message';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = 201;

@Service()
export class ExampleController {
    router: Router = Router();

    constructor(private readonly exampleService: ExampleService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        /**
         * @swagger
         *
         * definitions:
         *   Message:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       body:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Example
         *     description: Default cadriciel endpoint
         *   - name: Message
         *     description: Messages functions
         */

        /**
         * @swagger
         *
         * /api/example:
         *   get:
         *     description: Return current time with hello world
         *     tags:
         *       - Example
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         *
         */
        this.router.get('/', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            const time: Message = await this.exampleService.helloWorld();
            res.json(time);
        });
        /**
         * @swagger
         *
         * /api/example/populate:
         *   post:
         *     description: Populate the database with initial data
         *     tags:
         *       - Example
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Database populated
         */
        this.router.post('/populate', async (req: Request, res: Response) => {
            const message: Message = req.body;
            this.exampleService.storeMessage(message);
            await this.exampleService.populateDatabase();
            res.sendStatus(HTTP_STATUS_CREATED);
        });
        /**
         * @swagger
         *
         * /api/example/empty:
         *   delete:
         *     description: Empty the database
         *     tags:
         *       - Example
         *     responses:
         *       200:
         *         description: Database emptied
         */
        this.router.delete('/empty', async (req: Request, res: Response) => {
            const message: Message = req.body;
            this.exampleService.storeMessage(message);
            await this.exampleService.emptyDatabase();
            res.sendStatus(200);
        });
    
        /**
         * @swagger
         *
         * /api/example/deleteGame:
         *   delete:
         *     description: Delete only one game from the database
         *     tags:
         *       - Example
         *     parameters:
         *       - name: name
         *         in: query
         *         required: true
         *         type: string
         *     responses:
         *       200:
         *         description: Game deleted
         *       500:
         *         description: Failed to delete game
         */
        this.router.delete('/deleteGame', async (req: Request, res: Response) => {
            const gameName: string = req.query.name as string;
            try {
            await this.exampleService.deleteGame(gameName);
            res.sendStatus(200);
            } catch (error) {
            res.status(500).send('Failed to delete game');
            }
        });
        /**
         * @swagger
         *
         * /api/example/about:
         *   get:
         *     description: Return information about http api
         *     tags:
         *       - Example
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */
        this.router.get('/about', (req: Request, res: Response) => {
            // Send the request to the service and send the response
            res.json(this.exampleService.about());
        });

        /**
         * @swagger
         *
         * /api/example/games:
         *   get:
         *     description: Return the list of games in the database
         *     tags:
         *       - Example
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         description: List of games
         *         schema:
         *           type: array
         *           items:
         *             type: string
         */
        this.router.get('/games', async (req: Request, res: Response) => {
            const games = await this.exampleService.getGames();
            res.json(games);
        });
        /**
         * @swagger
         *
         * /api/example/send:
         *   post:
         *     description: Send a message
         *     tags:
         *       - Example
         *       - Message
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Message'
         *             example:
         *               title: Mon Message
         *               body: Je suis envoyé à partir de la documentation!
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */
        this.router.post('/send', (req: Request, res: Response) => {
            const message: Message = req.body;
            this.exampleService.storeMessage(message);
            res.sendStatus(HTTP_STATUS_CREATED);
        });

        /**
         * @swagger
         *
         * /api/example/all:
         *   get:
         *     description: Return all messages
         *     tags:
         *       - Example
         *       - Message
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         description: messages
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/definitions/Message'
         */
        this.router.get('/all', (req: Request, res: Response) => {
            res.json(this.exampleService.getAllMessages());
        });
    }
}
