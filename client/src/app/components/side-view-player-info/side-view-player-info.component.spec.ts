import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { DiceType } from '@common/enums/dice-type';
import { SideViewPlayerInfoComponent } from './side-view-player-info.component';

describe('SideViewPlayerInfoComponent', () => {
    let component: SideViewPlayerInfoComponent;
    let fixture: ComponentFixture<SideViewPlayerInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SideViewPlayerInfoComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SideViewPlayerInfoComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize attackDice and defenseDice based on playerCharacter.dice (Attack)', () => {
        component.playerCharacter = {
            attributes: { life: 5, defense: 3, speed: 4, attack: 6 },
            dice: DiceType.Attack,
        } as PlayerCharacter;

        component.ngOnInit();

        expect(component.attackDice).toBe('D6');
        expect(component.defenseDice).toBe('D4');
    });

    it('should initialize attackDice and defenseDice based on playerCharacter.dice (Defense)', () => {
        component.playerCharacter = {
            attributes: { life: 5, defense: 3, speed: 4, attack: 6 },
            dice: DiceType.Defense,
        } as PlayerCharacter;

        component.ngOnInit();

        expect(component.attackDice).toBe('D4');
        expect(component.defenseDice).toBe('D6');
    });

    it('should return correct healthArray', () => {
        component.playerCharacter = {
            attributes: { life: 5, defense: 3, speed: 4, attack: 6 },
            dice: DiceType.Attack,
        } as PlayerCharacter;

        expect(component.healthArray.length).toBe(5);
    });

    it('should return correct defenseArray', () => {
        component.playerCharacter = {
            attributes: { life: 5, defense: 3, speed: 4, attack: 6 },
            dice: DiceType.Attack,
        } as PlayerCharacter;

        expect(component.defenseArray.length).toBe(3);
    });

    it('should return correct speedArray', () => {
        component.playerCharacter = {
            attributes: { life: 5, defense: 3, speed: 4, attack: 6 },
            dice: DiceType.Attack,
        } as PlayerCharacter;

        expect(component.speedArray.length).toBe(4);
    });

    it('should return correct attackArray', () => {
        component.playerCharacter = {
            attributes: { life: 5, defense: 3, speed: 4, attack: 6 },
            dice: DiceType.Attack,
        } as PlayerCharacter;

        expect(component.attackArray.length).toBe(6);
    });
});
