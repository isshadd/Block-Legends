/* eslint-disable no-undef*/ // This is necessary to be able to test game service

import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { MAX_VP_PLAYER_NUMBER } from '@common/constants/game_constants';
import { ProfileEnum } from '@common/enums/profile';
import { GameService } from './game.service';

const ACCESS_CODE = 5678;
const FIVE = 5;

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
            if (!char) return;
            expect(char.name).toBe('New Hero');
            done();
        });
    });

    it('should generate virtual character correctly', () => {
        const index = 2;
        const virtualCharacter = service.generateVirtualCharacter(index, ProfileEnum.Agressive) as PlayerCharacter;
        expect(virtualCharacter.isVirtual).toBeTrue();
    });

    it('should clear game correctly', (done: DoneFn) => {
        service.setAccessCode(ACCESS_CODE);
        service.setCharacter(new PlayerCharacter('Hero'));

        service.clearGame();

        service.accessCode$.subscribe((code) => {
            expect(code).toBeNull();
            service.character$.subscribe((character) => {
                expect(character).toEqual(null);
                done();
            });
        });
    });

    it('should return VP_NUMBER correctly', () => {
        expect(MAX_VP_PLAYER_NUMBER).toBe(FIVE);
    });

    it('should set the current player correctly', (done: DoneFn) => {
        const player = new PlayerCharacter('Hero');
        service.setCurrentPlayer(player);
        service.currentPlayer$.subscribe((currentPlayer) => {
            expect(currentPlayer).toBe(player);
            done();
        });
    });

    it('should assign bonus to attack or defense randomly', () => {
        const player1 = service.generateVirtualCharacter(1, ProfileEnum.Agressive);

        player1.assignAttackDice();
        player1.assignLifeBonus();
        player1.assignSpeedBonus();
        player1.assignDefenseDice();
    });

    it('should release virtual players names correctly', () => {
        const player1 = service.generateVirtualCharacter(1, ProfileEnum.Agressive);
        const player2 = service.generateVirtualCharacter(2, ProfileEnum.Defensive);

        service.usedNames.add(player1.name);
        service.usedNames.add(player2.name);

        spyOn(service.usedNames, 'delete').and.callThrough();

        service.releaseVirtualPlayerName(player1.name);

        expect(service.usedNames.delete).toHaveBeenCalled();
        expect(service.usedNames.has(player1.name)).toBeFalse();
    });
});
