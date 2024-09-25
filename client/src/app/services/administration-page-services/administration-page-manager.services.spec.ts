import { TestBed } from '@angular/core/testing';
import { Game } from '@common/game.interface';
import { AdministrationPageManagerService } from './administration-page-manager.services';

describe('AdministrationPageManagerService', () => {
    let service: AdministrationPageManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AdministrationPageManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a list of games', () => {
        const GAMESLENGTH = 4;
        expect(service.games.length).toBe(GAMESLENGTH);
    });

    it('should return the correct games when getGames is called', () => {
        const mockGames: Game[] = [
            {
                id: 0,
                name: 'League Of Legends',
                size: 30,
                mode: 'CTF',
                imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
                lastModificationDate: new Date('2024-10-23'),
                isVisible: true,
            },
            {
                id: 1,
                name: 'Minecraft',
                size: 38,
                mode: 'Normal',
                imageUrl:
                    'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
                lastModificationDate: new Date('2020-01-03'),
                isVisible: true,
            },
        ];
        service.games = mockGames;
        const result = service.getGames();
        expect(result).toEqual(mockGames);
    });

    it('should delete a game', () => {
        const gameToDelete: Game = {
            id: 1,
            name: 'Minecraft',
            size: 38,
            mode: 'Normal',
            imageUrl: '',
            lastModificationDate: new Date(),
            isVisible: true,
        };
        const initialLength = service.games.length;
        service.deleteGame(gameToDelete);
        expect(service.games.length).toBe(initialLength - 1);
        expect(service.games.find((game) => game.id === gameToDelete.id)).toBeUndefined();
    });

    it('should toggle visibility of a game back and forth', () => {
        const gameToToggle: Game = service.games[0];
        const initialVisibility = gameToToggle.isVisible;
        service.toggleVisibility(gameToToggle);
        expect(gameToToggle.isVisible).toBe(!initialVisibility);
        service.toggleVisibility(gameToToggle);
        expect(gameToToggle.isVisible).toBe(initialVisibility);
    });

    it('should not delete a game that does not exist', () => {
        const gameToDelete: Game = {
            id: 999,
            name: 'Nonexistent Game',
            size: 0,
            mode: '',
            imageUrl: '',
            lastModificationDate: new Date(),
            isVisible: true,
        };
        const initialLength = service.games.length;
        service.deleteGame(gameToDelete);
        expect(service.games.length).toBe(initialLength);
    });

    it('should toggle visibility back and forth', () => {
        const gameToToggle: Game = service.games[0];
        const initialVisibility = gameToToggle.isVisible;
        service.toggleVisibility(gameToToggle);
        expect(gameToToggle.isVisible).toBe(!initialVisibility);
        service.toggleVisibility(gameToToggle);
        expect(gameToToggle.isVisible).toBe(initialVisibility);
    });
});
