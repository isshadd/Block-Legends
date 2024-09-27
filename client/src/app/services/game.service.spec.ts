import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from 'src/app/classes/Characters/player-character';
import { GameService, VP_NUMBER } from './game.service';

const MIN_CODE = 1000;
const MAX_CODE = 9999;

describe('GameService', () => {
    let service: GameService;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate an access code between 1000 and 9999', () => {
        service.generateAccessCode();
        const accessCode = service.getAccessCode();
        expect(accessCode).toBeGreaterThanOrEqual(MIN_CODE);
        expect(accessCode).toBeLessThanOrEqual(MAX_CODE);
    });

    it('should generate 5 virtual characters', () => {
        const characters = service.generateVirtualCharacters();
        expect(characters.length).toBe(VP_NUMBER);
        expect(characters[0]).toBeInstanceOf(PlayerCharacter);
        expect(characters[1].name).toBe('Joueur virtuel 2');
        expect(characters[2].name).toBe('Joueur virtuel 3');
    });

    it('should generate unique characters', () => {
        service.generateVirtualCharacters();
        const characterNames = service.characters.map((character) => character.name);
        const uniqueNames = new Set(characterNames);
        expect(uniqueNames.size).toBe(VP_NUMBER);
    });

    it('should add virtual characters to the characters array', () => {
        service.generateVirtualCharacters();
        expect(service.characters.length).toBe(VP_NUMBER);
    });
});
