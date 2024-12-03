import { TestBed } from '@angular/core/testing';
import { DebugService } from '@app/services/debug.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { ProfileEnum } from '@common/enums/profile';
import { Subject } from 'rxjs';
import { BattleManagerService } from './battle-manager.service';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';
import { VirtualPlayerBattleManagerService } from './virtual-player-battle-manager.service';

const REMAINING_HEALTH = 5;
const ATTACK_DICE = 6;
const EVASION_REMAINING = 2;
const NO_EVASION = 0;
const ICE_PENALTY = 10;
const CENT = 100;
const ATTACK_RESULT = 9;
const ATTACK_RESULT_2 = -12;
const DEFENSE_RESULT = 67;

describe('VirtualPlayerBattleManagerService', () => {
    let service: VirtualPlayerBattleManagerService;
    let mockPlayGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;
    let mockBattleManagerService: jasmine.SpyObj<BattleManagerService>;
    let mockDebugService: jasmine.SpyObj<DebugService>;

    beforeEach(() => {
        mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['findPlayerFromSocketId']);
        mockBattleManagerService = jasmine.createSpyObj('BattleManagerService', ['doesPlayerHaveItem', 'isPlayerHealthMax', 'hasIcePenalty'], {
            signalUserAttacked: new Subject(),
            signalUserTriedEscape: new Subject(),
            icePenalty: ICE_PENALTY,
        });
        mockDebugService = jasmine.createSpyObj('DebugService', ['isDebugMode']);

        TestBed.configureTestingModule({
            providers: [
                VirtualPlayerBattleManagerService,
                { provide: PlayGameBoardManagerService, useValue: mockPlayGameBoardManagerService },
                { provide: BattleManagerService, useValue: mockBattleManagerService },
                { provide: DebugService, useValue: mockDebugService },
            ],
        });

        service = TestBed.inject(VirtualPlayerBattleManagerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not proceed if virtualPlayer or enemyPlayer is not found', () => {
        mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(null);

        service.startTurn('player1', 'enemy1', REMAINING_HEALTH, REMAINING_HEALTH, EVASION_REMAINING);

        expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith('player1');
        expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith('enemy1');
    });

    it('should handle aggressive behavior', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Agressive, true);
        const enemyPlayer = createPlayer(ProfileEnum.Agressive, false);

        mockPlayGameBoardManagerService.findPlayerFromSocketId.and.callFake((id: string) => (id === 'player1' ? virtualPlayer : enemyPlayer));

        spyOn(service, 'attack');

        service.startTurn('player1', 'enemy1', REMAINING_HEALTH, REMAINING_HEALTH, EVASION_REMAINING);

        expect(service.attack).toHaveBeenCalledWith(virtualPlayer, enemyPlayer, REMAINING_HEALTH, REMAINING_HEALTH);
    });

    it('should handle defensive behavior and escape if possible', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Defensive, true);
        const enemyPlayer = createPlayer(ProfileEnum.Agressive, false);

        mockPlayGameBoardManagerService.findPlayerFromSocketId.and.callFake((id: string) => (id === 'player1' ? virtualPlayer : enemyPlayer));

        spyOn(service, 'escape');

        service.startTurn('player1', 'enemy1', REMAINING_HEALTH, REMAINING_HEALTH, EVASION_REMAINING);

        expect(service.escape).toHaveBeenCalledWith(virtualPlayer);
    });

    it('should attack if no evasion is possible', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Defensive, true);
        const enemyPlayer = createPlayer(ProfileEnum.Agressive, false);

        mockPlayGameBoardManagerService.findPlayerFromSocketId.and.callFake((id: string) => (id === 'player1' ? virtualPlayer : enemyPlayer));

        spyOn(service, 'attack');

        service.startTurn('player1', 'enemy1', REMAINING_HEALTH, REMAINING_HEALTH, NO_EVASION);

        expect(service.attack).toHaveBeenCalledWith(virtualPlayer, enemyPlayer, REMAINING_HEALTH, REMAINING_HEALTH);
    });

    it('should calculate attack result correctly', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Agressive, true);
        virtualPlayer.attackDice = ATTACK_DICE;
        virtualPlayer.attributes.attack = ATTACK_DICE;

        mockBattleManagerService.hasIcePenalty.and.returnValue(false);

        spyOn(Math, 'random').and.returnValue(0.4);

        mockDebugService.isDebugMode = false;

        const result = service.attackDiceResult(virtualPlayer);

        expect(result).toEqual(ATTACK_RESULT);
    });

    it('should calculate defense result correctly', () => {
        const enemyPlayer = createPlayer(ProfileEnum.Defensive, false);
        enemyPlayer.defenseDice = ATTACK_DICE;
        enemyPlayer.attributes.defense = ATTACK_DICE;

        mockBattleManagerService.doesPlayerHaveItem.and.returnValue(false);

        mockDebugService.isDebugMode = false;

        spyOn(Math, 'random').and.returnValue(10);

        const result = service.defenseDiceResult(enemyPlayer, REMAINING_HEALTH);

        expect(result).toEqual(DEFENSE_RESULT);
    });

    it('should emit attack signal on attack', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Agressive, true, 'player1');
        const enemyPlayer = createPlayer(ProfileEnum.Defensive, false, 'enemy1');

        spyOn(mockBattleManagerService.signalUserAttacked, 'next');

        service.attack(virtualPlayer, enemyPlayer, REMAINING_HEALTH, REMAINING_HEALTH);

        expect(mockBattleManagerService.signalUserAttacked.next).toHaveBeenCalled();
    });

    it('should emit escape signal on escape', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Defensive, true, 'player1');

        spyOn(mockBattleManagerService.signalUserTriedEscape, 'next');

        service.escape(virtualPlayer);

        expect(mockBattleManagerService.signalUserTriedEscape.next).toHaveBeenCalledWith('player1');
    });

    function createPlayer(comportement: ProfileEnum, isVirtual: boolean, socketId = ''): PlayerCharacter {
        return {
            socketId,
            comportement,
            isVirtual,
            attackDice: ATTACK_DICE,
            defenseDice: ATTACK_DICE,
            attributes: {
                attack: ATTACK_DICE,
                defense: ATTACK_DICE,
                life: ATTACK_DICE,
            },
        } as PlayerCharacter;
    }

    it('should calculate attack result in debug mode', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Agressive, true);
        virtualPlayer.attackDice = ATTACK_DICE;
        virtualPlayer.attributes.attack = ATTACK_DICE;

        mockDebugService.isDebugMode = true;

        const result = service.attackDiceResult(virtualPlayer);

        expect(result).toEqual(virtualPlayer.attributes.attack + virtualPlayer.attackDice);
    });

    it('should include potion defense boost in defense result', () => {
        const enemyPlayer = createPlayer(ProfileEnum.Defensive, false);
        enemyPlayer.defenseDice = ATTACK_DICE;
        enemyPlayer.attributes.defense = ATTACK_DICE;

        mockBattleManagerService.doesPlayerHaveItem.and.returnValue(true);

        spyOn(Math, 'random').and.returnValue(0.4);

        const result = service.defenseDiceResult(enemyPlayer, 1);

        expect(result).toEqual(CENT);
    });

    it('should penalize if ice penalty', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Agressive, true);

        virtualPlayer.attackDice = ATTACK_DICE;
        virtualPlayer.attributes.attack = ATTACK_DICE;

        mockBattleManagerService.hasIcePenalty.and.returnValue(true);

        const result = service.attackDiceResult(virtualPlayer);
        const result1 = service.attackDiceResult(virtualPlayer);

        expect(result - result1).toBeGreaterThanOrEqual(ATTACK_RESULT_2);
    });

    it('should penalize if ice penalty on defense', () => {
        const enemyPlayer = createPlayer(ProfileEnum.Defensive, false);

        enemyPlayer.defenseDice = ATTACK_DICE;
        enemyPlayer.attributes.defense = ATTACK_DICE;

        mockBattleManagerService.hasIcePenalty.and.returnValue(true);

        const result = service.defenseDiceResult(enemyPlayer, 1);
        const result1 = service.defenseDiceResult(enemyPlayer, 1);

        expect(result - result1).toBeGreaterThanOrEqual(ATTACK_RESULT_2);
    });

    it('should handle agressive comportment', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Agressive, true);
        const enemyPlayer = createPlayer(ProfileEnum.Agressive, false);

        spyOn(service, 'attack');

        service.handleAgressiveComportment(virtualPlayer, enemyPlayer, REMAINING_HEALTH, REMAINING_HEALTH);

        expect(service.attack).toHaveBeenCalledWith(virtualPlayer, enemyPlayer, REMAINING_HEALTH, REMAINING_HEALTH);
    });

    it('should handle defensive comportment', () => {
        const virtualPlayer = createPlayer(ProfileEnum.Defensive, true);
        const enemyPlayer = createPlayer(ProfileEnum.Agressive, false);

        spyOn(service, 'escape');
        spyOn(service, 'attack');

        service.handleDefensiveComportment(virtualPlayer, enemyPlayer, REMAINING_HEALTH, REMAINING_HEALTH, EVASION_REMAINING);

        expect(service.escape).toHaveBeenCalledWith(virtualPlayer);
        expect(service.attack).not.toHaveBeenCalled();
    });
});
