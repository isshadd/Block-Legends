import { ItemType } from '@common/enums/item-type';
import { ProfileEnum } from '@common/enums/profile';
import { Vec2 } from '@common/interfaces/vec2';
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
    messageColor: string;

    avatar: Avatar;
    attributes = new PlayerAttributes();
    mapEntity: PlayerMapEntity;
    isAbsent: boolean = false;
    inventory: Item[] = [new EmptyItem(), new EmptyItem()];
    textColor: string = '#006D77';

    currentMovePoints: number = 0;
    currentActionPoints: number = 0;

    // Statistics

    totalCombats: number = 0;
    totalEvasions: number = 0;
    fightWins: number = 0;
    fightLoses: number = 0;
    totalLostLife: number = 0;
    totalDamageDealt: number = 0;
    differentItemsGrabbed: ItemType[] = [];
    differentTerrainTilesVisited: Vec2[] = [];

    // Pour JV:

    isVirtual: boolean = false;
    comportement: ProfileEnum | null = null;

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
