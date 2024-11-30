/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { Elytra } from '@common/classes/Items/elytra';
import { Totem } from '@common/classes/Items/totem';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { ItemType } from '@common/enums/item-type';
import { BattleManagerService } from './battle-manager.service';
describe('BattleManagerService', () => {
    let service: BattleManagerService;
    let mockCurrentPlayer: PlayerCharacter;
    let mockOpponentPlayer: PlayerCharacter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BattleManagerService],
        });

        service = TestBed.inject(BattleManagerService);

        mockCurrentPlayer = new PlayerCharacter('player1');
        mockCurrentPlayer.socketId = 'player1';
        mockCurrentPlayer.attributes = { life: 0, defense: 0, attack: 0, speed: 0 };
        mockCurrentPlayer.mapEntity = new PlayerMapEntity('avatar.png');
        mockCurrentPlayer.mapEntity.isPlayerOnIce = false;
        mockCurrentPlayer.inventory = [];

        mockOpponentPlayer = new PlayerCharacter('player2');
        mockOpponentPlayer.socketId = 'player2';
        mockOpponentPlayer.attributes = { life: 0, defense: 0, attack: 0, speed: 0 };
        mockOpponentPlayer.mapEntity = new PlayerMapEntity('avatar.png');
        mockOpponentPlayer.mapEntity.isPlayerOnIce = false;
        mockOpponentPlayer.inventory = [];

        service.currentPlayer = mockCurrentPlayer;
        service.opponentPlayer = mockOpponentPlayer;
    });

    it('should initialize the battle with correct values', () => {
        service.init(mockCurrentPlayer, mockOpponentPlayer);

        expect(service.currentPlayer).toBe(mockCurrentPlayer);
        expect(service.opponentPlayer).toBe(mockOpponentPlayer);

        expect(service.userEvasionAttempts).toBe(service.startingEvadeAttempts);
        expect(service.opponentEvasionAttempts).toBe(service.startingEvadeAttempts);

        expect(service.userRemainingHealth).toBe(mockCurrentPlayer.attributes.life);
        expect(service.opponentRemainingHealth).toBe(mockOpponentPlayer.attributes.life);

        expect(service.userDefence).toBe(mockCurrentPlayer.attributes.defense);
        expect(service.opponentDefence).toBe(mockOpponentPlayer.attributes.defense);
    });

    it('should apply ice penalty only to players on ice', () => {
        mockCurrentPlayer.mapEntity.isPlayerOnIce = false;
        mockOpponentPlayer.mapEntity.isPlayerOnIce = true;

        service.init(mockCurrentPlayer, mockOpponentPlayer);

        expect(service.userDefence).toBe(mockCurrentPlayer.attributes.defense);
        expect(service.opponentDefence).toBe(mockOpponentPlayer.attributes.defense - service.icePenalty);
    });

    describe('isValidAction', () => {
        it('should return true if currentPlayer, opponentPlayer are set and isUserTurn is true', () => {
            service.isUserTurn = true;

            const result = service.isValidAction();

            expect(result).toBeTrue();
        });

        it('should return false if currentPlayer is null', () => {
            service.currentPlayer = null;
            service.isUserTurn = true;

            const result = service.isValidAction();

            expect(result).toBeFalse();
        });

        it('should return false if opponentPlayer is null', () => {
            service.opponentPlayer = null;
            service.isUserTurn = true;

            const result = service.isValidAction();

            expect(result).toBeFalse();
        });

        it('should return false if isUserTurn is false', () => {
            service.isUserTurn = false;

            const result = service.isValidAction();

            expect(result).toBeFalse();
        });
    });

    describe('onUserAttack', () => {
        it('should calculate and emit attack result if action is valid', () => {
            spyOn(service, 'isValidAction').and.returnValue(true);
            const attackDiceResult = 8;
            const defenseDiceResult = 3;
            spyOn(service, 'attackDiceResult').and.returnValue(attackDiceResult);
            spyOn(service, 'defenseDiceResult').and.returnValue(defenseDiceResult);
            const signalSpy = spyOn(service.signalUserAttacked, 'next');

            service.onUserAttack();
            const result = attackDiceResult - defenseDiceResult;
            expect(service.isValidAction).toHaveBeenCalled();
            expect(service.attackDiceResult).toHaveBeenCalled();
            expect(service.defenseDiceResult).toHaveBeenCalled();
            expect(service.doesPlayerHaveItem).toHaveBeenCalled();
            expect(service.isPlayerHealthMax).toHaveBeenCalled();
            expect(signalSpy).toHaveBeenCalledWith({ playerTurnId: mockCurrentPlayer.socketId, attackResult: result, playerHasTotem: false });

            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);
            spyOn(service, 'isPlayerHealthMax').and.returnValue(true);
            service.onUserAttack();
            expect(signalSpy).toHaveBeenCalledWith({ playerTurnId: mockCurrentPlayer.socketId, attackResult: result, playerHasTotem: true });
        });

        it('should not emit attack result if action is invalid', () => {
            spyOn(service, 'isValidAction').and.returnValue(false);
            const signalSpy = spyOn(service.signalUserAttacked, 'next');

            service.onUserAttack();

            expect(service.isValidAction).toHaveBeenCalled();
            expect(signalSpy).not.toHaveBeenCalled();
        });
    });

    describe('onUserEscape', () => {
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

    describe('onOpponentAttack', () => {
        it('should decrease userRemainingHealth and emit attack result if opponent attacks with positive result on opponent’s turn', () => {
            service.isUserTurn = false;
            service.userRemainingHealth = 1;
            service.opponentRemainingHealth = 1;
            const attackResult = 5;
            const signalSpy = spyOn(service.signalOpponentAttacked, 'next');

            service.onOpponentAttack(attackResult);
            const result = 0;
            expect(service.userRemainingHealth).toBe(result);
            expect(signalSpy).toHaveBeenCalledWith(attackResult);

            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);
            spyOn(service, 'isPlayerHealthMax').and.returnValue(false);

            service.onOpponentAttack(attackResult);
            const result2 = 2;

            expect(service.opponentRemainingHealth).toBe(result2);
        });

        it('should not decrease userRemainingHealth but emit attack result if opponent attacks with zero or negative result', () => {
            service.isUserTurn = false;
            service.userRemainingHealth = 1;
            const attackResult = 0;
            const signalSpy = spyOn(service.signalOpponentAttacked, 'next');

            service.onOpponentAttack(attackResult);

            const result = 1;
            expect(service.userRemainingHealth).toBe(result);
            expect(signalSpy).toHaveBeenCalledWith(attackResult);
        });

        it('should not emit signal or decrease health if it is user’s turn', () => {
            service.isUserTurn = true;
            service.userRemainingHealth = 1;
            const attackResult = 5;
            const signalSpy = spyOn(service.signalOpponentAttacked, 'next');

            service.onOpponentAttack(attackResult);

            const result = 10;
            expect(service.userRemainingHealth).toBe(result);
            expect(signalSpy).not.toHaveBeenCalled();
        });
    });

    describe('onOpponentEscape', () => {
        it('should decrease opponentEvasionAttempts and emit signal if it is opponent’s turn', () => {
            service.isUserTurn = false;
            service.opponentEvasionAttempts = 2;
            const signalSpy = spyOn(service.signalOpponentTriedEscape, 'next');

            service.onOpponentEscape();

            expect(service.opponentEvasionAttempts).toBe(1);
            expect(signalSpy).toHaveBeenCalled();
        });

        it('should not emit signal or decrease evasion attempts if it is user’s turn', () => {
            service.isUserTurn = true;
            service.opponentEvasionAttempts = 2;
            const signalSpy = spyOn(service.signalOpponentTriedEscape, 'next');

            service.onOpponentEscape();

            expect(service.opponentEvasionAttempts).toBe(2);
            expect(signalSpy).not.toHaveBeenCalled();
        });
    });

    describe('attackDiceResult', () => {
        it('should calculate attack result without ice penalty when player is not on ice', () => {
            service.currentPlayer = {
                attributes: { attack: 10 },
                attackDice: 6,
                mapEntity: { isPlayerOnIce: false },
            } as PlayerCharacter;

            spyOn(Math, 'random').and.returnValue(0.5);

            const result = service.attackDiceResult();

            const expectedResult = 14;
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

            const expectedResult = 12;
            expect(result).toBe(expectedResult);
        });

        it('should return 0 if currentPlayer is null', () => {
            service.currentPlayer = null;

            const result = service.attackDiceResult();

            expect(result).toBe(0);
        });
    });
    describe('defenseDiceResult', () => {
        it('should calculate defense result based on opponentDefense and defense dice when opponent player is set', () => {
            service.opponentPlayer = {
                defenseDice: 6,
            } as PlayerCharacter;
            service.opponentDefence = 4;
            service.opponentRemainingHealth = 1;

            spyOn(service, 'doesPlayerHaveItem').and.returnValue(false);
            spyOn(Math, 'random').and.returnValue(1);

            const result = service.defenseDiceResult();

            const expectedResult = 10;
            expect(result).toBe(expectedResult);

            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);

            const result2 = service.defenseDiceResult();
            const expectedResult2 = 100;
            expect(result2).toBe(expectedResult2);
        });

        it('should return 0 if opponentPlayer is null', () => {
            service.opponentPlayer = null;

            const result = service.defenseDiceResult();

            expect(result).toBe(0);
        });
    });

    describe('onSuccessfulAttack', () => {
        it('should decrease opponentRemainingHealth by 1 if action is valid', () => {
            spyOn(service, 'isValidAction').and.returnValue(true);
            service.opponentRemainingHealth = 1;
            service.userRemainingHealth = 1;

            service.onSuccessfulAttack();

            expect(service.isValidAction).toHaveBeenCalled();
            const remainingHealth = 0;
            expect(service.opponentRemainingHealth).toBe(remainingHealth);

            spyOn(service, 'doesPlayerHaveItem').and.returnValue(true);
            spyOn(service, 'isPlayerHealthMax').and.returnValue(false);

            expect(service.userRemainingHealth).toBe(2);
        });

        it('should not decrease opponentRemainingHealth if action is invalid', () => {
            spyOn(service, 'isValidAction').and.returnValue(false);
            service.opponentRemainingHealth = 1;
            service.onSuccessfulAttack();

            expect(service.isValidAction).toHaveBeenCalled();
            const remainingHealth = 1;
            expect(service.opponentRemainingHealth).toBe(remainingHealth);
        });
    });

    describe('endBattle', () => {
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

    describe('isPlayerHealthMax', () => {
        it('should return true if player is max health', () => {
            spyOn(service, 'isPlayerHealthMax');
            const result = service.isPlayerHealthMax(mockCurrentPlayer, mockCurrentPlayer.attributes.life);
            expect(result).toBeTrue();
        });

        it('should return false if player is not max health', () => {
            spyOn(service, 'isPlayerHealthMax');
            const result = service.isPlayerHealthMax(mockCurrentPlayer, mockCurrentPlayer.attributes.life - 1);
            expect(result).toBeFalse();
        });
    });

    describe('isPlayerHealthMax', () => {
        it('should return true if player has specific item', () => {
            mockCurrentPlayer.inventory = [new Totem()];

            const result = service.doesPlayerHaveItem(mockCurrentPlayer, ItemType.Totem);
            expect(result).toBeTrue();
        });

        it('should return false if player does not have specific item', () => {
            mockCurrentPlayer.inventory = [];

            const result = service.doesPlayerHaveItem(mockCurrentPlayer, ItemType.Totem);
            expect(result).toBeFalse();
        });
    });

    describe('hasIcePenalty', () => {
        it('should return true if player is on ice and does not have specific item', () => {
            mockCurrentPlayer.mapEntity.isPlayerOnIce = true;
            mockCurrentPlayer.inventory = [];

            spyOn(service, 'hasIcePenalty');
            const result = service.hasIcePenalty(mockCurrentPlayer);
            expect(result).toBeTrue();
        });

        it('should return false if player is not on ice', () => {
            mockCurrentPlayer.mapEntity.isPlayerOnIce = false;

            spyOn(service, 'hasIcePenalty');
            const result = service.hasIcePenalty(mockCurrentPlayer);
            expect(result).toBeFalse();
        });

        it('should return false if player is on ice and has specific item', () => {
            mockCurrentPlayer.mapEntity.isPlayerOnIce = true;
            mockCurrentPlayer.inventory = [new Elytra()];

            spyOn(service, 'hasIcePenalty');
            const result = service.hasIcePenalty(mockCurrentPlayer);
            expect(result).toBeFalse();
        });
    });

    describe('clearBattle', () => {
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
});
