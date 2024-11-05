// src/app/services/game-services/game.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService, VP_NUMBER } from './game.service';

describe('GameService', () => {
    let service: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize accessCode$ and character$', (done: DoneFn) => {
        service.accessCode$.subscribe((code) => {
            expect(code).toBeNull();
            done();
        });
        service.character$.subscribe((character) => {
            expect(character).toEqual(new PlayerCharacter(''));
            // done();
        });
    });

    it('should set and get access code correctly', (done: DoneFn) => {
        service.setAccessCode(5678);
        service.accessCode$.subscribe((code) => {
            expect(code).toBe(5678);
            done();
        });
    });

    it('should set and get character correctly', (done: DoneFn) => {
        const character = new PlayerCharacter('Hero');
        service.setCharacter(character);
        service.character$.subscribe((char) => {
            expect(char).toBe(character);
            done();
        });
    });

    it('should generate virtual character correctly', () => {
        const index = 2;
        const virtualCharacter = service.generateVirtualCharacter(index);
        expect(virtualCharacter.name).toBe('Joueur virtuel 3');
    });

    it('should clear game correctly', (done: DoneFn) => {
        service.setAccessCode(5678);
        service.setCharacter(new PlayerCharacter('Hero'));

        service.clearGame();

        service.accessCode$.subscribe((code) => {
            expect(code).toBeNull();
            service.character$.subscribe((character) => {
                expect(character).toEqual(new PlayerCharacter(''));
                done();
            });
        });
    });

    it('should return VP_NUMBER correctly', () => {
        expect(VP_NUMBER).toBe(5);
    });
});
