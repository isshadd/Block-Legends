import { PlayerCharacter } from '@app/classes/Characters/player-character';

export interface GameRoom {
    roomId: string;
    accessCode: number;
    players: PlayerCharacter[];
    isLocked: boolean;
    maxPlayers: number;
    currentPlayerTurn: string;
}
