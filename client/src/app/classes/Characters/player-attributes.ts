export const BASE_STATS = 4;

export class PlayerAttributes {
    constructor(
        public life: number = BASE_STATS,
        public speed: number = BASE_STATS,
        public attack: number = BASE_STATS,
        public defense: number = BASE_STATS,
    ) {}
}
