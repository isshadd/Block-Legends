import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BattleManagerService } from '@app/services/play-page-services/game-board/battle-manager.service';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { BehaviorSubject } from 'rxjs';
import { FightViewComponent } from './fight-view.component';

describe('FightViewComponent', () => {
    let component: FightViewComponent;
    let fixture: ComponentFixture<FightViewComponent>;
    let battleManagerService: jasmine.SpyObj<BattleManagerService>;
    let playerImage: HTMLElement;
    let opponentImage: HTMLElement;

    const mockPlayer = { avatar: AvatarEnum.Alex };

    const signalUserAttacked$ = new BehaviorSubject<number>(0);
    const signalUserTriedEscape$ = new BehaviorSubject<void>(undefined);
    const signalOpponentAttacked$ = new BehaviorSubject<number>(0);
    const signalOpponentTriedEscape$ = new BehaviorSubject<void>(undefined);

    beforeEach(async () => {
        const battleManagerSpy = jasmine.createSpyObj('BattleManagerService', ['onUserAttack', 'onUserEscape'], {
            signalUserAttacked$: signalUserAttacked$.asObservable(),
            signalUserTriedEscape$: signalUserTriedEscape$.asObservable(),
            signalOpponentAttacked$: signalOpponentAttacked$.asObservable(),
            signalOpponentTriedEscape$: signalOpponentTriedEscape$.asObservable(),
            isUserTurn: true,
            userEvasionAttempts: 1,
            opponentDefence: 3,
            userDefence: 4,
            opponentPlayer: mockPlayer,
            opponentRemainingHealth: 5,
            currentPlayer: mockPlayer,
            userRemainingHealth: 7,
        });

        await TestBed.configureTestingModule({
            imports: [FightViewComponent],
            providers: [{ provide: BattleManagerService, useValue: battleManagerSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(FightViewComponent);
        component = fixture.componentInstance;
        battleManagerService = TestBed.inject(BattleManagerService) as jasmine.SpyObj<BattleManagerService>;

        const diceResultElement = document.createElement('div');
        diceResultElement.id = 'dice-result';
        document.body.appendChild(diceResultElement);

        playerImage = document.createElement('div');
        playerImage.id = 'player';
        document.body.appendChild(playerImage);

        opponentImage = document.createElement('div');
        opponentImage.id = 'opponent';
        document.body.appendChild(opponentImage);
    });

    afterEach(() => {
        const diceResultElement = document.getElementById('dice-result');
        if (diceResultElement) {
            diceResultElement.remove();
        }

        playerImage.remove();
        opponentImage.remove();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call onUserAttack when onAttack is invoked', () => {
        component.onAttack();
        expect(battleManagerService.onUserAttack).toHaveBeenCalled();
    });

    it('should call onUserEscape when onEscape is invoked', () => {
        component.onEscape();
        expect(battleManagerService.onUserEscape).toHaveBeenCalled();
    });

    it('should trigger attackAnimation on signalUserAttacked$', () => {
        spyOn(component, 'attackAnimation');
        const value = 5;
        signalUserAttacked$.next(value);
        expect(component.attackAnimation).toHaveBeenCalledWith(value);
    });

    it('should trigger escapeAnimation on signalUserTriedEscape$', () => {
        spyOn(component, 'escapeAnimation');
        signalUserTriedEscape$.next();
        expect(component.escapeAnimation).toHaveBeenCalled();
    });

    it('should update playerDiceResult and add dice-roll class in onPlayerRollDice', () => {
        const riceResult = 6;
        component.onPlayerRollDice(riceResult);
        expect(component.playerDiceResult).toBe(riceResult);
        const diceResult = document.getElementById('dice-result');
        expect(diceResult?.classList).toContain('dice-roll');
    });

    it('should return an array with length equal to opponentRemainingHealth when opponentPlayer exists', () => {
        expect(component.opponentPlayerHealthArray.length).toBe(battleManagerService.opponentRemainingHealth);
    });

    it('should return an array with length equal to opponentDefence when opponentPlayer exists', () => {
        expect(component.opponentPlayerDefenseArray.length).toBe(battleManagerService.opponentDefence);
    });

    it('should return an array with length equal to userRemainingHealth when currentPlayer exists', () => {
        expect(component.playerHealthArray.length).toBe(battleManagerService.userRemainingHealth);
    });

    it('should return an array with length equal to userDefence when currentPlayer exists', () => {
        expect(component.playerDefenseArray.length).toBe(battleManagerService.userDefence);
    });

    const DELAY = 1000; // Define the delay duration

    it('should remove "attack-player" class from playerImage after delay', fakeAsync(() => {
        playerImage.classList.add('attack-player');

        spyOn(playerImage.classList, 'remove');

        component.onPlayerAttack();

        tick(DELAY);

        expect(playerImage.classList.remove).toHaveBeenCalledWith('attack-player');
    }));

    it('should remove "attack-opponent" class from opponentImage after delay', fakeAsync(() => {
        opponentImage.classList.add('attack-opponent'); // Initial setup: add "attack-opponent" class
        spyOn(opponentImage.classList, 'remove'); // Spy on remove method

        component.onOpponentAttack();

        tick(DELAY); // Simulate the delay

        expect(opponentImage.classList.remove).toHaveBeenCalledWith('attack-opponent');
    }));

    it('should remove "hit" class from playerImage after delay', fakeAsync(() => {
        playerImage.classList.add('hit'); // Initial setup: add "hit" class
        spyOn(playerImage.classList, 'remove'); // Spy on remove method

        component.onOpponentAttack();

        tick(DELAY); // Simulate the delay

        expect(playerImage.classList.remove).toHaveBeenCalledWith('hit');
    }));

    it('should return false if isUserTurn is true and userEvasionAttempts is greater than 0', () => {
        battleManagerService.isUserTurn = true;
        battleManagerService.userEvasionAttempts = 2;
        fixture.detectChanges();
        expect(component.isEscapeDisabled()).toBeFalse();
    });
});
