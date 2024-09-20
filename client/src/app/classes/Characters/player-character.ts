import { PlayerAttributes } from './player-attributes';

export const BONUS_LIFE = 6;
export const BONUS_SPEED = 6;
export const DICE_6 = 6;
export const DICE_4 = 4;
export const BASE_STATS = 4;

export class PlayerCharacter {
    public isAttackDiceAssigned: boolean = false;
    public isDefenseDiceAssigned: boolean = false;
    public isLifeOrSpeedBonusAssigned: boolean = false;
    public bonusAttribute: string;
    public isOrganizer: boolean = false;
    constructor(
        public name: string,
        public avatar: string,
        public attributes = new PlayerAttributes(),
    ) {}

    diceAttribution(attribute: string) {
        if (attribute === 'attack' && !this.isAttackDiceAssigned && !this.isAttackDiceAssigned) {
            this.attributes.attack += Math.floor(Math.random() * DICE_6) + 1;
            this.attributes.defense += Math.floor(Math.random() * DICE_4) + 1;
        } else if (attribute === 'defense' && !this.isDefenseDiceAssigned && !this.isAttackDiceAssigned) {
            this.attributes.defense += Math.floor(Math.random() * DICE_6) + 1;
            this.attributes.attack += Math.floor(Math.random() * DICE_4) + 1;
        }
        this.isAttackDiceAssigned = true;
        this.isDefenseDiceAssigned = true;
    }

    assignBonus() {
        if (this.bonusAttribute === 'life') {
            this.attributes.life = BONUS_LIFE;
            this.attributes.speed = BASE_STATS;
        } else if (this.bonusAttribute === 'speed') {
            this.attributes.speed = BONUS_SPEED;
            this.attributes.life = BASE_STATS;
        }
        this.isLifeOrSpeedBonusAssigned = true;
    }

    setOrganizer() {
        this.isOrganizer = true;
    }
}
