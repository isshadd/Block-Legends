export const BONUS_LIFE = 6;
export const BONUS_SPEED = 6;
export const DICE_6 = 6;
export const DICE_4 = 4;
export const BASE_STATS = 4;

export class playerCharacter {
    constructor(
        public name: string,
        public avatar = { name: '', imgSrc1: '', imgSrc2: '' },
        public life: number = 4,
        public speed: number = 4,
        public attack: number = 4,
        public defense: number = 4,
    ) {}
    isAttackDiceAssigned: boolean = false;
    isDefenseDiceAssigned: boolean = false;
    isLifeOrSpeedBonusAssigned: boolean = false;
    bonusAttribute: string;

    diceAttribution(attribute: string) {
        if (attribute === 'attack' && !this.isAttackDiceAssigned && !this.isAttackDiceAssigned) {
            this.attack += Math.floor(Math.random() * DICE_6) + 1;
            this.defense += Math.floor(Math.random() * DICE_4) + 1;
        } else if (attribute === 'defense' && !this.isDefenseDiceAssigned && !this.isAttackDiceAssigned) {
            this.defense += Math.floor(Math.random() * DICE_6) + 1;
            this.attack += Math.floor(Math.random() * DICE_4) + 1;
        }
        this.isAttackDiceAssigned = true;
        this.isDefenseDiceAssigned = true;
    }

    assignBonus() {
        if (this.bonusAttribute === 'life') {
            this.life = BONUS_LIFE;
            this.speed = BASE_STATS;
        } else if (this.bonusAttribute === 'speed') {
            this.speed = BONUS_SPEED;
            this.life = BASE_STATS;
        }
        this.isLifeOrSpeedBonusAssigned = true;
    }
}
