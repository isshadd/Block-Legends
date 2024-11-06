import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { BattleManagerService } from './battle-manager.service';
describe('BattleManagerService - init', () => {
    let service: BattleManagerService;
    let mockCurrentPlayer: PlayerCharacter;
    let mockOpponentPlayer: PlayerCharacter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });

        service = TestBed.inject(BattleManagerService);

        mockCurrentPlayer = {
            attributes: { life: 10, defense: 5, attack: 7 },
            attackDice: 6,
            defenseDice: 6,
            mapEntity: { isPlayerOnIce: true },
        } as PlayerCharacter;

        mockOpponentPlayer = {
            attributes: { life: 8, defense: 4, attack: 6 },
            attackDice: 6,
            defenseDice: 6,
            mapEntity: { isPlayerOnIce: false },
        } as PlayerCharacter;
    });

    it('should initialize the battle with correct values', () => {
        service.init(mockCurrentPlayer, mockOpponentPlayer);

        expect(service.currentPlayer).toBe(mockCurrentPlayer);
        expect(service.opponentPlayer).toBe(mockOpponentPlayer);

        expect(service.userEvasionAttempts).toBe(service.STARTING_EVADE_ATTEMPTS);
        expect(service.opponentEvasionAttempts).toBe(service.STARTING_EVADE_ATTEMPTS);

        expect(service.userRemainingHealth).toBe(mockCurrentPlayer.attributes.life);
        expect(service.opponentRemainingHealth).toBe(mockOpponentPlayer.attributes.life);

        expect(service.userDefence).toBe(mockCurrentPlayer.attributes.defense - service.ICE_PENALITY);
        expect(service.opponentDefence).toBe(mockOpponentPlayer.attributes.defense);
    });

    it('should apply ice penalty only to players on ice', () => {
        mockCurrentPlayer.mapEntity.isPlayerOnIce = false;
        mockOpponentPlayer.mapEntity.isPlayerOnIce = true;

        service.init(mockCurrentPlayer, mockOpponentPlayer);

        expect(service.userDefence).toBe(mockCurrentPlayer.attributes.defense);
        expect(service.opponentDefence).toBe(mockOpponentPlayer.attributes.defense - service.ICE_PENALITY);
    });
});

describe('BattleManagerService - isValidAction', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });

        service = TestBed.inject(BattleManagerService);
    });

    it('should return true if currentPlayer, opponentPlayer are set and isUserTurn is true', () => {
        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = {} as PlayerCharacter;
        service.isUserTurn = true;

        const result = service.isValidAction();

        expect(result).toBeTrue();
    });

    it('should return false if currentPlayer is null', () => {
        service.currentPlayer = null;
        service.opponentPlayer = {} as PlayerCharacter;
        service.isUserTurn = true;

        const result = service.isValidAction();

        expect(result).toBeFalse();
    });

    it('should return false if opponentPlayer is null', () => {
        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = null;
        service.isUserTurn = true;

        const result = service.isValidAction();

        expect(result).toBeFalse();
    });

    it('should return false if isUserTurn is false', () => {
        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = {} as PlayerCharacter;
        service.isUserTurn = false;

        const result = service.isValidAction();

        expect(result).toBeFalse();
    });
});

describe('BattleManagerService - onUserAttack', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);

        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = {} as PlayerCharacter;
    });

    it('should calculate and emit attack result if action is valid', () => {
        spyOn(service, 'isValidAction').and.returnValue(true);
        spyOn(service, 'attackDiceResult').and.returnValue(8);
        spyOn(service, 'defenseDiceResult').and.returnValue(3);
        const signalSpy = spyOn(service.signalUserAttacked, 'next');

        service.onUserAttack();

        expect(service.isValidAction).toHaveBeenCalled();
        expect(service.attackDiceResult).toHaveBeenCalled();
        expect(service.defenseDiceResult).toHaveBeenCalled();
        expect(signalSpy).toHaveBeenCalledWith(5);
    });

    it('should not emit attack result if action is invalid', () => {
        spyOn(service, 'isValidAction').and.returnValue(false);
        const signalSpy = spyOn(service.signalUserAttacked, 'next');

        service.onUserAttack();

        expect(service.isValidAction).toHaveBeenCalled();
        expect(signalSpy).not.toHaveBeenCalled();
    });
});

describe('BattleManagerService - onUserEscape', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);

        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = {} as PlayerCharacter;
    });

    it('should decrease userEvasionAttempts and emit signal if action is valid and evasion attempts are available', () => {
        spyOn(service, 'isValidAction').and.returnValue(true);
        service.userEvasionAttempts = 2;
        const signalSpy = spyOn(service.signalUserTriedEscape, 'next');

        service.onUserEscape();

        expect(service.isValidAction).toHaveBeenCalled();
        expect(service.userEvasionAttempts).toBe(1);
        expect(signalSpy).toHaveBeenCalled();
    });

    it('should not emit signal if evasion attempts are zero', () => {
        spyOn(service, 'isValidAction').and.returnValue(true);
        service.userEvasionAttempts = 0;
        const signalSpy = spyOn(service.signalUserTriedEscape, 'next');

        service.onUserEscape();

        expect(service.isValidAction).toHaveBeenCalled();
        expect(service.userEvasionAttempts).toBe(0);
        expect(signalSpy).not.toHaveBeenCalled();
    });

    it('should not emit signal or decrease attempts if action is invalid', () => {
        spyOn(service, 'isValidAction').and.returnValue(false);
        service.userEvasionAttempts = 2;
        const signalSpy = spyOn(service.signalUserTriedEscape, 'next');

        service.onUserEscape();

        expect(service.isValidAction).toHaveBeenCalled();
        expect(service.userEvasionAttempts).toBe(2);
        expect(signalSpy).not.toHaveBeenCalled();
    });
});

describe('BattleManagerService - onOpponentAttack', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);

        service.currentPlayer = { attributes: { life: 10 } } as PlayerCharacter;
        service.opponentPlayer = {} as PlayerCharacter;
        service.userRemainingHealth = 10;
    });

    it('should decrease userRemainingHealth and emit attack result if opponent attacks with positive result on opponent’s turn', () => {
        service.isUserTurn = false;
        const attackResult = 5;
        const signalSpy = spyOn(service.signalOpponentAttacked, 'next');

        service.onOpponentAttack(attackResult);

        expect(service.userRemainingHealth).toBe(9);
        expect(signalSpy).toHaveBeenCalledWith(attackResult);
    });

    it('should not decrease userRemainingHealth but emit attack result if opponent attacks with zero or negative result', () => {
        service.isUserTurn = false;
        const attackResult = 0;
        const signalSpy = spyOn(service.signalOpponentAttacked, 'next');

        service.onOpponentAttack(attackResult);

        expect(service.userRemainingHealth).toBe(10);
        expect(signalSpy).toHaveBeenCalledWith(attackResult);
    });

    it('should not emit signal or decrease health if it is user’s turn', () => {
        service.isUserTurn = true;
        const attackResult = 5;
        const signalSpy = spyOn(service.signalOpponentAttacked, 'next');

        service.onOpponentAttack(attackResult);

        expect(service.userRemainingHealth).toBe(10);
        expect(signalSpy).not.toHaveBeenCalled();
    });
});

describe('BattleManagerService - onOpponentEscape', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);

        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = {} as PlayerCharacter;
        service.opponentEvasionAttempts = 2;
    });

    it('should decrease opponentEvasionAttempts and emit signal if it is opponent’s turn', () => {
        service.isUserTurn = false;
        const signalSpy = spyOn(service.signalOpponentTriedEscape, 'next');

        service.onOpponentEscape();

        expect(service.opponentEvasionAttempts).toBe(1);
        expect(signalSpy).toHaveBeenCalled();
    });

    it('should not emit signal or decrease evasion attempts if it is user’s turn', () => {
        service.isUserTurn = true;
        const signalSpy = spyOn(service.signalOpponentTriedEscape, 'next');

        service.onOpponentEscape();

        expect(service.opponentEvasionAttempts).toBe(2);
        expect(signalSpy).not.toHaveBeenCalled();
    });
});

describe('BattleManagerService - attackDiceResult', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);
    });

    it('should calculate attack result without ice penalty when player is not on ice', () => {
        service.currentPlayer = {
            attributes: { attack: 10 },
            attackDice: 6,
            mapEntity: { isPlayerOnIce: false },
        } as PlayerCharacter;

        spyOn(Math, 'random').and.returnValue(0.5);

        const result = service.attackDiceResult();

        let expectedResult = 14;
        expect(result).toBe(expectedResult);
    });

    it('should calculate attack result with ice penalty when player is on ice', () => {
        service.currentPlayer = {
            attributes: { attack: 10 },
            attackDice: 6,
            mapEntity: { isPlayerOnIce: true },
        } as PlayerCharacter;

        spyOn(Math, 'random').and.returnValue(0.5);

        const result = service.attackDiceResult();

        let expectedResult = 12;
        expect(result).toBe(expectedResult);
    });

    it('should return 0 if currentPlayer is null', () => {
        service.currentPlayer = null;

        const result = service.attackDiceResult();

        expect(result).toBe(0);
    });
});
describe('BattleManagerService - defenseDiceResult', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);
    });

    it('should calculate defense result based on opponentDefense and defense dice when opponent player is set', () => {
        service.opponentPlayer = {
            defenseDice: 6,
        } as PlayerCharacter;
        service.opponentDefence = 4;

        spyOn(Math, 'random').and.returnValue(0.5);

        const result = service.defenseDiceResult();

        let expectedResult = 8;
        expect(result).toBe(expectedResult);
    });

    it('should return 0 if opponentPlayer is null', () => {
        service.opponentPlayer = null;

        const result = service.defenseDiceResult();

        expect(result).toBe(0);
    });
});

describe('BattleManagerService - onSuccessfulAttack', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);

        service.opponentPlayer = {} as PlayerCharacter;
        service.opponentRemainingHealth = 10;
    });

    it('should decrease opponentRemainingHealth by 1 if action is valid', () => {
        spyOn(service, 'isValidAction').and.returnValue(true);

        service.onSuccessfulAttack();

        expect(service.isValidAction).toHaveBeenCalled();
        expect(service.opponentRemainingHealth).toBe(9);
    });

    it('should not decrease opponentRemainingHealth if action is invalid', () => {
        spyOn(service, 'isValidAction').and.returnValue(false);

        service.onSuccessfulAttack();

        expect(service.isValidAction).toHaveBeenCalled();
        expect(service.opponentRemainingHealth).toBe(10);
    });
});

describe('BattleManagerService - endBattle', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);
    });

    it('should set isBattleOn to false immediately and call clearBattle after 1000 ms', () => {
        spyOn(service, 'clearBattle');

        jasmine.clock().install();
        service.isBattleOn = true;

        service.endBattle();

        expect(service.isBattleOn).toBeFalse();
        jasmine.clock().tick(1000);

        expect(service.clearBattle).toHaveBeenCalled();

        jasmine.clock().uninstall();
    });
});

describe('BattleManagerService - clearBattle', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);

        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = {} as PlayerCharacter;
        service.currentPlayerIdTurn = 'player1';
        service.isUserTurn = true;
        service.userEvasionAttempts = 2;
        service.opponentEvasionAttempts = 2;
        service.userRemainingHealth = 10;
        service.opponentRemainingHealth = 8;
        service.userDefence = 5;
        service.opponentDefence = 4;
        service.isBattleOn = true;
    });

    it('should reset all battle properties to initial values', () => {
        service.clearBattle();

        expect(service.currentPlayer).toBeNull();
        expect(service.opponentPlayer).toBeNull();
        expect(service.currentPlayerIdTurn).toBeNull();
        expect(service.isUserTurn).toBeFalse();
        expect(service.userEvasionAttempts).toBe(0);
        expect(service.opponentEvasionAttempts).toBe(0);
        expect(service.userRemainingHealth).toBe(0);
        expect(service.opponentRemainingHealth).toBe(0);
        expect(service.userDefence).toBe(0);
        expect(service.opponentDefence).toBe(0);
        expect(service.isBattleOn).toBeFalse();
    });
});

describe('BattleManagerService - onOpponentAttack early return', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);

        service.userRemainingHealth = 10;
    });

    it('should return early if currentPlayer is null', () => {
        service.currentPlayer = null;
        service.opponentPlayer = {} as PlayerCharacter;
        const signalSpy = spyOn(service.signalOpponentAttacked, 'next');

        service.onOpponentAttack(5);

        expect(signalSpy).not.toHaveBeenCalled();
        expect(service.userRemainingHealth).toBe(10);
    });

    it('should return early if opponentPlayer is null', () => {
        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = null;
        const signalSpy = spyOn(service.signalOpponentAttacked, 'next');

        service.onOpponentAttack(5);

        expect(signalSpy).not.toHaveBeenCalled();
        expect(service.userRemainingHealth).toBe(10);
    });
});

describe('BattleManagerService - onOpponentEscape early return', () => {
    let service: BattleManagerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });
        service = TestBed.inject(BattleManagerService);

        service.opponentEvasionAttempts = 2; 
    });

    it('should return early if currentPlayer is null', () => {
        service.currentPlayer = null;
        service.opponentPlayer = {} as PlayerCharacter;
        const signalSpy = spyOn(service.signalOpponentTriedEscape, 'next');

        service.onOpponentEscape();

        expect(signalSpy).not.toHaveBeenCalled();
        expect(service.opponentEvasionAttempts).toBe(2); 
    });

    it('should return early if opponentPlayer is null', () => {
        service.currentPlayer = {} as PlayerCharacter;
        service.opponentPlayer = null;
        const signalSpy = spyOn(service.signalOpponentTriedEscape, 'next');

        service.onOpponentEscape();

        expect(signalSpy).not.toHaveBeenCalled();
        expect(service.opponentEvasionAttempts).toBe(2); 
    });
});

