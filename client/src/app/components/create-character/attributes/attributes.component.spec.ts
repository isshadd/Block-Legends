import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerAttributes } from '@common/classes/Player/player-attributes';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { AttributesComponent } from './attributes.component';
import { BASE_DICE_STAT } from '@common/constants/game_constants';

describe('AttributesComponent', () => {
    let component: AttributesComponent;
    let fixture: ComponentFixture<AttributesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AttributesComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AttributesComponent);
        component = fixture.componentInstance;

        component.character = new PlayerCharacter('Test');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create new attributes', () => {
        component.character.attributes = new PlayerAttributes();
        expect(component.character.attributes.attack).toBe(BASE_DICE_STAT);
        expect(component.character.attributes.defense).toBe(BASE_DICE_STAT);
        expect(component.character.attributes.life).toBe(BASE_DICE_STAT);
        expect(component.character.attributes.speed).toBe(BASE_DICE_STAT);
    });

    it('should assign attack dice and update selected defense dice', () => {
        const event = { target: { value: 'dice6' } } as unknown as Event;
        spyOn(component.character, 'assignAttackDice');
        component.assignAttackDice(event);
        expect(component.selectedAttackDice).toBe('dice6');
        expect(component.selectedDefenseDice).toBe('dice4');
        expect(component.character.assignAttackDice).toHaveBeenCalled();
    });

    it('should assign defense dice and update selected attack dice', () => {
        const event = { target: { value: 'dice4' } } as unknown as Event;
        spyOn(component.character, 'assignDefenseDice');
        component.assignDefenseDice(event);
        expect(component.selectedDefenseDice).toBe('dice4');
        expect(component.selectedAttackDice).toBe('dice6');
        expect(component.character.assignDefenseDice).toHaveBeenCalled();
    });

    it('should assign attack dice and update selected defense dice', () => {
        const event = { target: { value: 'dice4' } } as unknown as Event;
        spyOn(component.character, 'assignAttackDice');
        component.assignAttackDice(event);
        expect(component.selectedAttackDice).toBe('dice4');
        expect(component.selectedDefenseDice).toBe('dice6');
        expect(component.character.assignAttackDice).toHaveBeenCalled();
    });

    it('should assign defense dice and update selected attack dice', () => {
        const event = { target: { value: 'dice6' } } as unknown as Event;
        spyOn(component.character, 'assignDefenseDice');
        component.assignDefenseDice(event);
        expect(component.selectedDefenseDice).toBe('dice6');
        expect(component.selectedAttackDice).toBe('dice4');
        expect(component.character.assignDefenseDice).toHaveBeenCalled();
    });
});
