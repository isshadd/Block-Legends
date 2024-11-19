import { PlayerCharacter } from '../classes/Player/player-character';

export interface GameRoom {
    id: string;
    accessCode: number;
    players: PlayerCharacter[];
    isLocked: boolean;
    maxPlayers: number;
    currentPlayerTurn: string;
    organizer: string;
}
