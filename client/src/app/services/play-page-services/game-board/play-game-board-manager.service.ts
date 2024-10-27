import { Injectable } from '@angular/core';
import { Tile } from '@app/classes/Tiles/tile';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { GameRoom, WebSocketService } from '@app/services/SocketService/websocket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameBoardManagerService {
    roomInfo: GameRoom = this.webSocketService.getRoomInfo();

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public webSocketService: WebSocketService,
        public gameServerCommunicationService: GameServerCommunicationService,
    ) {
        gameServerCommunicationService.getGame(this.roomInfo.roomId).subscribe((game) => {
            this.gameMapDataManagerService.init(game);
        });

        // console.log(this.webSocketService.getRoomInfo());
    }

    getCurrentGrid(): Tile[][] {
        return this.gameMapDataManagerService.getCurrentGrid();
    }
}
