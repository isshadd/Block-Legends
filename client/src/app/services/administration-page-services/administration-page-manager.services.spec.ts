import { TestBed } from '@angular/core/testing';
import { Game } from '@common/game.interface';
import { AdministrationPageManagerService } from './administration-page-manager.services';

import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { CommunicationService } from '@app/services/communication.service';

describe('AdministrationPageManagerService', () => {
    let service: AdministrationPageManagerService;
    let mockGames: Game[];
    let gameToDelete: Game;
    let gameToToggle: Game;
    const GAMESLENGTH = 0;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AdministrationPageManagerService, GameServerCommunicationService, CommunicationService],
        });
        service = TestBed.inject(AdministrationPageManagerService);

        mockGames = [
            {
                name: 'League Of Legends',
                size: 30,
                mode: 'CTF',
                imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
                lastModificationDate: new Date('2024-10-23'),
                isVisible: true,
                description: `League of Legends is a team-based strategy game where two teams of five powerful champions face off to destroy the 
                other’s base. Choose from over 140 champions to make epic plays, secure kills, and take down towers as you battle for victory.`,
            },
            {
                name: 'Minecraft',
                size: 38,
                mode: 'classique',
                imageUrl:
                    'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
                lastModificationDate: new Date('2020-01-03'),
                isVisible: true,
                description: `Minecraft is a game about placing blocks and going on adventures. Explore randomly generated worlds and build amazing 
                things from the simplest of homes to the grandest of castles.`,
            },
        ];
        gameToDelete = mockGames[0];
        gameToToggle = mockGames[1];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a list of games', () => {
        expect(service.games.length).toBe(GAMESLENGTH);
    });
    // a changer -> probleme de liste qui commence a zero au lieu de deux

    it('should delete a game', () => {
        const initialLength = service.games.length;
        service.deleteGame(gameToDelete);
        expect(service.games.length).toBe(initialLength);
        expect(service.games.find((game) => game.name === gameToDelete.name)).toBeUndefined();
    });
    // a changer -> probleme de liste qui commence a zero au lieu de quatre

    it('should toggle visibility of a game back and forth', () => {
        const initialVisibility = gameToToggle.isVisible;
        service.toggleVisibility(gameToToggle);
        expect(gameToToggle.isVisible).toBe(!initialVisibility);
        service.toggleVisibility(gameToToggle);
        expect(gameToToggle.isVisible).toBe(initialVisibility);
    });

    it('should not delete a game that does not exist', () => {
        const unexistingGame: Game = {
            name: 'Unexisting Game',
            size: 10,
            mode: 'CTF',
            imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
            description: 'This game does not exist',
        };
        const initialLength = service.games.length;
        service.deleteGame(unexistingGame);
        expect(service.games.length).toBe(initialLength);
    });

    it('should toggle visibility back and forth', () => {
        const initialVisibility = gameToToggle.isVisible;
        service.toggleVisibility(gameToToggle);
        expect(gameToToggle.isVisible).toBe(!initialVisibility);
        service.toggleVisibility(gameToToggle);
        expect(gameToToggle.isVisible).toBe(initialVisibility);
    });
});
