import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { BASE_STATS, BONUS, PlayerCharacter } from '@app/classes/Characters/player-character';
import { AttributesComponent } from './attributes.component';

describe('AttributesComponent', () => {
    let component: AttributesComponent;
    let fixture: ComponentFixture<AttributesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AttributesComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AttributesComponent);
        component = fixture.componentInstance;

        component.character = new PlayerCharacter('Nom du personnage', '', new PlayerAttributes());

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create new attributes', () => {
        component.character.attributes = new PlayerAttributes();
        expect(component.character.attributes.attack).toBe(BASE_STATS);
        expect(component.character.attributes.defense).toBe(BASE_STATS);
        expect(component.character.attributes.life).toBe(BASE_STATS);
        expect(component.character.attributes.speed).toBe(BASE_STATS);
    });

    it('should assign bonus to life', () => {
        component.character.assignLifeBonus();
        expect(component.character.attributes.life).toBe(BONUS);
        expect(component.character.attributes.speed).toBe(BASE_STATS);
        expect(component.character.isLifeBonusAssigned).toBeTrue();
        expect(component.character.isSpeedBonusAssigned).toBeTrue();
    });

    it('should assign bonus to spped', () => {
        component.character.assignSpeedBonus();
        expect(component.character.attributes.speed).toBe(BONUS);
        expect(component.character.attributes.life).toBe(BASE_STATS);
        expect(component.character.isLifeBonusAssigned).toBeTrue();
        expect(component.character.isSpeedBonusAssigned).toBeTrue();
    });

    it('should assign a dice to attack', () => {
        component.character.assignAttackDice();
        // expect(component.character.attributes.attack).toBeGreaterThan(BASE_STATS);
        expect(component.character.isAttackBonusAssigned).toBeTrue();
        expect(component.character.isDefenseBonusAssigned).toBeTrue();
    });

    it('should assign a dice to defense', () => {
        component.character.assignDefenseDice();
        // expect(component.character.attributes.defense).toBeGreaterThan(BASE_STATS);
        expect(component.character.isAttackBonusAssigned).toBeTrue();
        expect(component.character.isDefenseBonusAssigned).toBeTrue();
    });
});
