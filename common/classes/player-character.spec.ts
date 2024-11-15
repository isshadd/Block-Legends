import { BASE_STATS, BONUS, PlayerCharacter } from './player-character';

describe('PlayerCharacter', () => {
    let component: PlayerCharacter;

    beforeEach(() => {
        component = new PlayerCharacter('Test');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should assign bonus to life', () => {
        component.assignLifeBonus();
        expect(component.attributes.life).toBe(BONUS);
        expect(component.attributes.speed).toBe(BASE_STATS);
        expect(component.isLifeBonusAssigned).toBe(true);
        expect(component.isSpeedBonusAssigned).toBe(true);
    });

    it('should assign bonus to speed', () => {
        component.assignSpeedBonus();
        expect(component.attributes.speed).toBe(BONUS);
        expect(component.attributes.life).toBe(BASE_STATS);
        expect(component.isLifeBonusAssigned).toBe(true);
        expect(component.isSpeedBonusAssigned).toBe(true);
    });

    it('should assign a dice to attack', () => {
        component.assignAttackDice();
        expect(component.isAttackBonusAssigned).toBe(true);
        expect(component.isDefenseBonusAssigned).toBe(true);
    });

    it('should assign a dice to defense', () => {
        component.assignDefenseDice();
        expect(component.isAttackBonusAssigned).toBe(true);
        expect(component.isDefenseBonusAssigned).toBe(true);
    });

    it('should set organizer', () => {
        component.setOrganizer();
        expect(component.isOrganizer).toBe(true);
    });
});
