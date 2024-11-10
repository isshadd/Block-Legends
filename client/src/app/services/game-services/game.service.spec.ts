/* eslint-disable no-undef*/

import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@common/classes/player-character';
import { GameService, VP_NUMBER } from './game.service';

const ACCESS_CODE = 5678;
const CINQ = 5;

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
        service.setAccessCode(ACCESS_CODE);
        service.accessCode$.subscribe((code) => {
            expect(code).toBe(ACCESS_CODE);
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

    it('should update player name correctly', (done: DoneFn) => {
        service.setCharacter(new PlayerCharacter('Hero'));
        service.updatePlayerName('New Hero');
        service.character$.subscribe((char) => {
            expect(char.name).toBe('New Hero');
            done();
        });
    });

    it('should generate virtual character correctly', () => {
        const index = 2;
        const virtualCharacter = service.generateVirtualCharacter(index);
        expect(virtualCharacter.name).toBe('Joueur virtuel 3');
    });

    it('should clear game correctly', (done: DoneFn) => {
        service.setAccessCode(ACCESS_CODE);
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
        expect(VP_NUMBER).toBe(CINQ);
    });
});
