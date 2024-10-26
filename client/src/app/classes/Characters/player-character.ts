import { Avatar } from '@common/enums/avatar-enum';
import { PlayerAttributes } from './player-attributes';

export const BONUS = 6;
export const BASE_STATS = 4;

export class PlayerCharacter {
    isLifeBonusAssigned: boolean = false;
    isSpeedBonusAssigned: boolean = false;
    isAttackBonusAssigned: boolean = true;
    isDefenseBonusAssigned: boolean = true;
    isOrganizer: boolean = false;
    dice: string;
    isNameValid: boolean = false;
    avatar: Avatar;
    constructor(
        public name: string,
        public attributes = new PlayerAttributes(),
    ) {}

    assignAttackDice() {
        this.dice = 'attack';
        this.isAttackBonusAssigned = true;
        this.isDefenseBonusAssigned = true;
    }

    assignDefenseDice() {
        this.dice = 'defense';
        this.isDefenseBonusAssigned = true;
        this.isAttackBonusAssigned = true;
    }

    assignLifeBonus() {
        this.attributes.life = BONUS;
        this.attributes.speed = BASE_STATS;
        this.isLifeBonusAssigned = true;
        this.isSpeedBonusAssigned = true;
    }

    assignSpeedBonus() {
        this.attributes.speed = BONUS;
        this.attributes.life = BASE_STATS;
        this.isSpeedBonusAssigned = true;
        this.isLifeBonusAssigned = true;
    }

    setOrganizer() {
        this.isOrganizer = true;
    }
}
