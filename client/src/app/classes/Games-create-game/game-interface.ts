export class Game {
    constructor(
        public name: string,
        public size: number,
        public mode: string,
        public imgSrc: string,
        public lastModif: Date,
        public visible: boolean
    ) {}
}
