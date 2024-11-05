import { Avatar } from '@common/enums/avatar-enum';
import { PlayerAttributes } from './player-attributes';
import { PlayerMapEntity } from './player-map-entity';

export const BONUS = 6;
export const BASE_STATS = 4;

export class PlayerCharacter {
    isLifeBonusAssigned: boolean = false;
    isSpeedBonusAssigned: boolean = false;
    isAttackBonusAssigned: boolean = true;
    isDefenseBonusAssigned: boolean = true;
    isOrganizer: boolean = false;
    socketId: string;
    dice: string;
    isNameValid: boolean = false;
    avatar: Avatar;
    attributes = new PlayerAttributes();
    mapEntity: PlayerMapEntity;
    isAbsent: boolean = false;

    constructor(public name: string) {}

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
