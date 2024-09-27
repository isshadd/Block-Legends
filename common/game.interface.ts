export interface Game {
    id: number;
    name: string;
    size: number;
    mode: string;
    imageUrl: string;
    lastModificationDate: Date;
    isVisible: boolean;
    description?: string; ////a verifier si c'est optionnel ou pas
}
