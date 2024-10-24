import { TestBed } from '@angular/core/testing';
import { PlayerAttributes } from 'src/app/classes/Characters/player-attributes';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';
import { GameService } from './game.service';

describe('GameService', () => {
    let mockService: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GameService],
        });
        mockService = TestBed.inject(GameService);
    });

    it('should initialize accessCode$ with null', (done) => {
        mockService.accessCode$.subscribe((code) => {
            expect(code).toBeNull();
            done();
        });
    });

    it('should initialize character$ with a default PlayerCharacter', (done) => {
        mockService.character$.subscribe((character) => {
            expect(character).toEqual(new PlayerCharacter('', '', new PlayerAttributes()));
            done();
        });
    });

    it('should set the access code', (done) => {
        const code = 1234;
        mockService.accessCode$.subscribe((newCode) => {
            if (newCode === code) {
                expect(newCode).toBe(code);
                done();
            }
        });
        mockService.setAccessCode(code);
    });

    it('should set the character', (done) => {
        const character = new PlayerCharacter('Player1', '', new PlayerAttributes());
        mockService.character$.subscribe((newCharacter) => {
            if (newCharacter.name === character.name) {
                expect(newCharacter).toEqual(character);
                done();
            }
        });
        mockService.setCharacter(character);
    });

    it('should generate a virtual character', () => {
        const index = 0;
        const virtualCharacter = mockService.generateVirtualCharacter(index);
        expect(virtualCharacter.name).toBe('Joueur virtuel 1');
        expect(virtualCharacter).toBeInstanceOf(PlayerCharacter);
    });

    // Test clearGame
    it('should clear game state', (done) => {
        const character = new PlayerCharacter('Player1', '', new PlayerAttributes());
        mockService.setCharacter(character);
        mockService.setAccessCode(1234);

        mockService.accessCode$.subscribe((code) => {
            expect(code).toBeNull();
        });

        mockService.character$.subscribe((newCharacter) => {
            expect(newCharacter).toEqual(new PlayerCharacter('', '', new PlayerAttributes()));
            done();
        });

        mockService.clearGame();
    });
});
