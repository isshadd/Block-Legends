import { PlayerCharacter } from '../../common/classes/player-character';

export interface GameRoom {
    id: string;
    accessCode: number;
    players: PlayerCharacter[];
    isLocked: boolean;
    maxPlayers: number;
    currentPlayerTurn: string;
    organizer: string;
}
