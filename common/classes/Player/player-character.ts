import { Avatar } from '../../enums/avatar-enum';
import { Character } from '../../interfaces/character';
import { EmptyItem } from '../Items/empty-item';
import { Item } from '../Items/item';
import { PlayerAttributes } from './player-attributes';
import { PlayerMapEntity } from './player-map-entity';

export const BONUS = 6;
export const BASE_STATS = 4;

export class PlayerCharacter implements Character {
    isLifeBonusAssigned: boolean = false;
    isSpeedBonusAssigned: boolean = false;
    isAttackBonusAssigned: boolean = true;
    isDefenseBonusAssigned: boolean = true;
    isOrganizer: boolean = false;
    socketId: string;
    dice: string = 'attack';
    attackDice: number = BONUS;
    defenseDice: number = BASE_STATS;
    fightWins: number = 0;
    avatar: Avatar;
    attributes = new PlayerAttributes();
    mapEntity: PlayerMapEntity;
    isAbsent: boolean = false;
    inventory: Item[] = [new EmptyItem(), new EmptyItem()];

    constructor(public name: string) {}

    assignAttackDice() {
        this.dice = 'attack';
        this.attackDice = BONUS;
        this.defenseDice = BASE_STATS;
        this.isAttackBonusAssigned = true;
        this.isDefenseBonusAssigned = true;
    }

    assignDefenseDice() {
        this.dice = 'defense';
        this.defenseDice = BONUS;
        this.attackDice = BASE_STATS;
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
