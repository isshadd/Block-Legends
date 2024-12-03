import { ItemType } from '@common/enums/item-type';
import { ProfileEnum } from '@common/enums/profile';
import { Vec2 } from '@common/interfaces/vec2';
import { Avatar } from '../../enums/avatar-enum';
import { DiceType } from '../../enums/dice-type';
import { Character } from '../../interfaces/character';
import { EmptyItem } from '../Items/empty-item';
import { Item } from '../Items/item';
import { PlayerAttributes } from './player-attributes';
import { PlayerMapEntity } from './player-map-entity';
import { BASE_DICE_STAT,BONUS_DICE_STAT} from '../../constants/game_constants';


export class PlayerCharacter implements Character {
    isLifeBonusAssigned: boolean = false;
    isSpeedBonusAssigned: boolean = false;
    isAttackBonusAssigned: boolean = true;
    isDefenseBonusAssigned: boolean = true;
    isOrganizer: boolean = false;
    socketId: string;
    dice: DiceType = DiceType.Attack;
    attackDice: number = BONUS_DICE_STAT;
    defenseDice: number = BASE_DICE_STAT;
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

    isVirtual: boolean = false;
    comportement: ProfileEnum | null = null;

    constructor(public name: string) {}

    assignAttackDice() {
        this.dice = DiceType.Attack;
        this.attackDice = BONUS_DICE_STAT;
        this.defenseDice = BASE_DICE_STAT;
        this.isAttackBonusAssigned = true;
        this.isDefenseBonusAssigned = true;
    }

    assignDefenseDice() {
        this.dice = DiceType.Defense;
        this.defenseDice = BONUS_DICE_STAT;
        this.attackDice = BASE_DICE_STAT;
        this.isDefenseBonusAssigned = true;
        this.isAttackBonusAssigned = true;
    }

    assignLifeBonus() {
        this.attributes.life = BONUS_DICE_STAT;
        this.attributes.speed = BASE_DICE_STAT;
        this.isLifeBonusAssigned = true;
        this.isSpeedBonusAssigned = true;
    }

    assignSpeedBonus() {
        this.attributes.speed = BONUS_DICE_STAT;
        this.attributes.life = BASE_DICE_STAT;
        this.isSpeedBonusAssigned = true;
        this.isLifeBonusAssigned = true;
    }

    setOrganizer() {
        this.isOrganizer = true;
    }
}
