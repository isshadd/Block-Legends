// this file is responsible for handling the game board events and managing the game board state, because of that it cannot be refactored, so next line is necessary
/* eslint-disable max-lines */
import { GameSocketRoomService } from '@app/services/gateway-services/game-socket-room/game-socket-room.service';
import { PlayGameBoardBattleService } from '@app/services/gateway-services/play-game-board-battle-time/play-game-board-battle.service';
import { PlayGameBoardSocketService } from '@app/services/gateway-services/play-game-board-socket/play-game-board-socket.service';
import { PlayGameBoardTimeService } from '@app/services/gateway-services/play-game-board-time/play-game-board-time.service';
import {
    PlayerNumberStatisticType,
    PlayGameStatisticsService,
} from '@app/services/gateway-services/play-game-statistics/play-game-statistics.service';
import { MOUVEMENT_INTERVAL } from '@common/constants/game_constants';
import { GameTimerState } from '@common/enums/game.timer.state';
import { SocketEvents } from '@common/enums/gateway-events/socket-events';
import { ItemType } from '@common/enums/item-type';
import { GameBoardParameters } from '@common/interfaces/game-board-parameters';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable, Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class PlayGameBoardGateway {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(PlayGameBoardGateway.name);

    constructor(
        private readonly playGameBoardSocketService: PlayGameBoardSocketService,
        private readonly playGameBoardTimeService: PlayGameBoardTimeService,
        private readonly playGameBoardBattleService: PlayGameBoardBattleService,
        private readonly gameSocketRoomService: GameSocketRoomService,
        private readonly playGameStatisticsService: PlayGameStatisticsService,
    ) {
        this.playGameBoardTimeService.signalRoomTimePassed$.subscribe((accessCode) => {
            this.updateRoomTime(accessCode);
        });
        this.playGameBoardTimeService.signalRoomTimeOut$.subscribe((accessCode) => {
            this.handleTimeOut(accessCode);
        });
        this.gameSocketRoomService.signalPlayerLeftRoom$.subscribe(({ accessCode, playerSocketId }) => {
            this.handlePlayerLeftRoom(accessCode, playerSocketId);
        });
        this.playGameBoardBattleService.signalRoomTimeOut$.subscribe((accessCode) => {
            this.handleBattleTimeOut(accessCode);
        });
        this.playGameBoardBattleService.signalRoomTimePassed$.subscribe((accessCode) => {
            this.handleBattleSecondPassed(accessCode);
        });
    }

    @SubscribeMessage(SocketEvents.INIT_GAME_BOARD)
    handleInitGameBoard(client: Socket) {
        const room = this.gameSocketRoomService.getRoomBySocketId(client.id);
        if (!room) return;

        const gameBoardParameters: GameBoardParameters = this.gameSocketRoomService.gameBoardRooms.get(room.accessCode);
        if (gameBoardParameters) {
            client.emit(SocketEvents.INIT_GAME_BOARD_PARAMETERS, gameBoardParameters);
            this.playGameBoardTimeService.setTimerPreparingTurn(room.accessCode);
            this.updateRoomTime(room.accessCode);
            this.playGameBoardTimeService.resumeTimer(room.accessCode);
        } else {
            client.emit(SocketEvents.ERROR, { message: 'Room pas trouvé' });
        }
    }

    @SubscribeMessage(SocketEvents.USER_END_TURN)
    handleUserEndTurn(client: Socket, playerTurnId: string) {
        if (!this.isClientTurn(playerTurnId)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(playerTurnId);
        this.handleTimeOut(room.accessCode);
    }

    @SubscribeMessage(SocketEvents.USER_STARTED_MOVING)
    handleUserStartedMoving(client: Socket, playerTurnId: string) {
        if (!this.isClientTurn(playerTurnId)) {
            return;
        }

        client.emit(SocketEvents.USER_DID_MOVE);
        const room = this.gameSocketRoomService.getRoomBySocketId(playerTurnId);
        this.playGameBoardTimeService.pauseTimer(room.accessCode);
    }

    @SubscribeMessage(SocketEvents.USER_FINISHED_MOVING)
    handleUserFinishedMoving(client: Socket, playerTurnId: string) {
        if (!this.isClientTurn(playerTurnId)) {
            return;
        }

        client.emit(SocketEvents.USER_FINISHED_MOVE);
        const room = this.gameSocketRoomService.getRoomBySocketId(playerTurnId);
        this.playGameBoardTimeService.resumeTimer(room.accessCode);
    }

    @SubscribeMessage(SocketEvents.USER_MOVED)
    handleUserMoved(client: Socket, data: { fromTile: Vec2; toTile: Vec2; playerTurnId: string; isTeleport: boolean }) {
        if (!this.isClientTurn(data.playerTurnId)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(data.playerTurnId);

        this.playGameStatisticsService.addDifferentTerrainTileVisited(room.accessCode, data.playerTurnId, data.fromTile);
        this.playGameStatisticsService.addDifferentTerrainTileVisited(room.accessCode, data.playerTurnId, data.toTile);

        this.server.to(room.accessCode.toString()).emit(SocketEvents.ROOM_USER_MOVED, {
            playerId: data.playerTurnId,
            fromTile: data.fromTile,
            toTile: data.toTile,
            isTeleport: data.isTeleport,
        });
    }

    @SubscribeMessage(SocketEvents.VIRTUAL_PLAYER_CHOOSED_DESTINATION)
    handleVirtualPlayerChoosedDestination(client: Socket, data: { coordinates: Vec2; virtualPlayerId: string }) {
        const room = this.gameSocketRoomService.getRoomBySocketId(data.virtualPlayerId);
        if (!room) return;

        setTimeout(() => {
            this.server
                .to(this.playGameBoardSocketService.getRandomClientInRoom(room.accessCode))
                .emit(SocketEvents.VIRTUAL_PLAYER_MOVED, { destination: data.coordinates, virtualPlayerId: data.virtualPlayerId });
        }, MOUVEMENT_INTERVAL);
    }

    @SubscribeMessage(SocketEvents.USER_GRABBED_ITEM)
    handleUserGrabbedItem(client: Socket, data: { itemType: ItemType; tileCoordinates: Vec2; playerTurnId: string }) {
        const room = this.gameSocketRoomService.getRoomBySocketId(data.playerTurnId);
        if (!room) return;

        this.playGameStatisticsService.addPlayerDifferentItemGrabbed(room.accessCode, data.playerTurnId, data.itemType);
        this.server.to(room.accessCode.toString()).emit(SocketEvents.ROOM_USER_GRABBED_ITEM, {
            playerId: data.playerTurnId,
            itemType: data.itemType,
            tileCoordinate: data.tileCoordinates,
        });
    }

    @SubscribeMessage(SocketEvents.VIRTUAL_PLAYER_CONTINUE_TURN)
    handleVirtualPlayerContinueTurn(client: Socket, virtualPlayerId: string) {
        if (!this.isClientTurn(virtualPlayerId)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(virtualPlayerId);
        setTimeout(() => {
            this.continueVirtualPlayerTurn(room.accessCode, virtualPlayerId);
        }, this.playGameBoardSocketService.getRandomDelay());
    }

    @SubscribeMessage(SocketEvents.USER_THREW_ITEM)
    handleUserThrewItem(client: Socket, data: { itemType: ItemType; tileCoordinates: Vec2; playerTurnId: string }) {
        const room = this.gameSocketRoomService.getRoomBySocketId(data.playerTurnId);
        if (!room) return;

        this.server
            .to(room.accessCode.toString())
            .emit(SocketEvents.ROOM_USER_THREW_ITEM, { playerId: data.playerTurnId, itemType: data.itemType, tileCoordinate: data.tileCoordinates });
    }

    @SubscribeMessage(SocketEvents.USER_RESPAWNED)
    handleUserRespawned(client: Socket, data: { fromTile: Vec2; toTile: Vec2; playerTurnId: string }) {
        const room = this.gameSocketRoomService.getRoomBySocketId(data.playerTurnId);
        if (!room) return;

        this.server
            .to(room.accessCode.toString())
            .emit(SocketEvents.ROOM_USER_RESPAWNED, { playerId: data.playerTurnId, fromTile: data.fromTile, toTile: data.toTile });
    }

    @SubscribeMessage(SocketEvents.USER_DID_DOOR_ACTION)
    handleUserDidDoorAction(client: Socket, data: { tileCoordinate: Vec2; playerTurnId: string }) {
        if (!this.isClientTurn(data.playerTurnId)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(data.playerTurnId);
        this.playGameStatisticsService.increaseGameTotalDoorsInteracted(room.accessCode, data.tileCoordinate);
        this.server
            .to(room.accessCode.toString())
            .emit(SocketEvents.ROOM_USER_DID_DOOR_ACTION, { tileCoordinate: data.tileCoordinate, playerId: data.playerTurnId });
    }

    @SubscribeMessage(SocketEvents.USER_DID_BATTLE_ACTION)
    handleUserDidBattleAction(client: Socket, data: { playerTurnId: string; enemyPlayerId: string }) {
        if (!this.isClientTurn(data.playerTurnId)) {
            return;
        }

        const room = this.gameSocketRoomService.getRoomBySocketId(data.playerTurnId);
        this.handleStartBattle(room.accessCode, data.playerTurnId, data.enemyPlayerId);
        this.server
            .to(room.accessCode.toString())
            .emit(SocketEvents.ROOM_USER_DID_BATTLE_ACTION, { playerId: data.playerTurnId, enemyPlayerId: data.enemyPlayerId });
    }

    @SubscribeMessage(SocketEvents.USER_ATTACKED)
    handleUserAttacked(client: Socket, data: { playerTurnId: string; attackResult: number; playerHasTotem: boolean }) {
        const room = this.gameSocketRoomService.getRoomBySocketId(data.playerTurnId);
        if (!room) return;

        this.server.to(room.accessCode.toString()).emit(SocketEvents.OPPONENT_ATTACKED, data.attackResult);

        if (data.attackResult > 0) {
            const isPlayerDead = this.playGameBoardBattleService.userSucceededAttack(room.accessCode, data.playerHasTotem);

            this.server.to(room.accessCode.toString()).emit(SocketEvents.SUCCESSFUL_ATTACK);

            if (isPlayerDead) {
                this.handleBattleEndedByDeath(room.accessCode, data.playerTurnId);
                return;
            }
        }

        this.endBattleTurn(room.accessCode);
    }

    @SubscribeMessage(SocketEvents.USER_TRIED_ESCAPE)
    handleUserTriedEscape(client: Socket, playerTurnId: string) {
        const room = this.gameSocketRoomService.getRoomBySocketId(playerTurnId);
        if (!room) return;

        this.server.to(room.accessCode.toString()).emit(SocketEvents.OPPONENT_TRIED_ESCAPE);

        if (this.playGameBoardBattleService.userUsedEvade(room.accessCode, playerTurnId)) {
            this.playGameStatisticsService.increasePlayerStatistic(room.accessCode, playerTurnId, PlayerNumberStatisticType.TotalEvasions);
            this.handleBattleEndedByEscape(room.accessCode);
            return;
        }

        this.endBattleTurn(room.accessCode);
    }

    @SubscribeMessage(SocketEvents.USER_WON)
    handleUserWon(client: Socket, playerTurnId: string) {
        const room = this.gameSocketRoomService.getRoomBySocketId(playerTurnId);
        if (!room) return;

        this.playGameBoardTimeService.pauseTimer(room.accessCode);
        const gameStatistics = this.playGameStatisticsService.endGameStatistics(room.accessCode);
        this.server.to(room.accessCode.toString()).emit(SocketEvents.GAME_BOARD_PLAYER_WON, { playerTurnId, gameStatistics });
    }

    isClientTurn(clientId: string): boolean {
        const room = this.gameSocketRoomService.getRoomBySocketId(clientId);

        if (!room) {
            return false;
        }

        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(room.accessCode);

        if (room.currentPlayerTurn !== clientId || gameTimer.state !== GameTimerState.ActiveTurn) {
            this.logger.error(`Ce n'est pas le tour du joueur: ${clientId}`);
            return false;
        }

        return true;
    }

    startRoomGame(accessCode: number) {
        this.playGameBoardSocketService.initRoomGameBoard(accessCode);
        this.server.to(accessCode.toString()).emit(SocketEvents.GAME_STARTED);
    }

    updateRoomTime(accessCode: number) {
        this.server.to(accessCode.toString()).emit(SocketEvents.SET_TIME, this.gameSocketRoomService.gameTimerRooms.get(accessCode).time);
    }

    endRoomTurn(accessCode: number) {
        this.server.to(accessCode.toString()).emit(SocketEvents.END_TURN);
    }

    startRoomTurn(accessCode: number, playerIdTurn: string) {
        this.server.to(accessCode.toString()).emit(SocketEvents.START_TURN, playerIdTurn);
        this.playGameStatisticsService.increaseGameTotalPlayerTurns(accessCode);
        if (this.playGameBoardSocketService.getPlayerBySocketId(accessCode, playerIdTurn).isVirtual) {
            setTimeout(() => {
                this.startVirtualPlayerTurn(accessCode, playerIdTurn);
            }, this.playGameBoardSocketService.getRandomDelay());
        }
    }

    startVirtualPlayerTurn(accessCode: number, playerId: string) {
        this.server.to(this.playGameBoardSocketService.getRandomClientInRoom(accessCode)).emit(SocketEvents.START_VIRTUAL_PLAYER_TURN, playerId);
    }

    continueVirtualPlayerTurn(accessCode: number, playerId: string) {
        this.server.to(this.playGameBoardSocketService.getRandomClientInRoom(accessCode)).emit(SocketEvents.CONTINUE_VIRTUAL_PLAYER_TURN, playerId);
    }

    startBattleTurn(accessCode: number, playerId: string) {
        this.server.to(accessCode.toString()).emit(SocketEvents.START_BATTLE_TURN, playerId);
        if (this.playGameBoardSocketService.getPlayerBySocketId(accessCode, playerId).isVirtual) {
            setTimeout(() => {
                const data = this.playGameBoardBattleService.getVirtualPlayerBattleData(accessCode, playerId);
                this.server
                    .to(this.playGameBoardSocketService.getRandomClientInRoom(accessCode))
                    .emit(SocketEvents.START_VIRTUAL_PLAYER_BATTLE_TURN, data);
            }, this.playGameBoardSocketService.getRandomDelay());
        }
    }

    handleStartBattle(accessCode: number, playerId: string, enemyPlayerId: string) {
        this.playGameBoardTimeService.pauseTimer(accessCode);
        this.playGameBoardBattleService.createBattleTimer(accessCode, playerId, enemyPlayerId);

        this.playGameStatisticsService.increasePlayerStatistic(accessCode, playerId, PlayerNumberStatisticType.TotalCombats);
        this.playGameStatisticsService.increasePlayerStatistic(accessCode, enemyPlayerId, PlayerNumberStatisticType.TotalCombats);

        const playerTurn = this.playGameBoardBattleService.getPlayerBattleTurn(accessCode);
        this.startBattleTurn(accessCode, playerTurn);
    }

    handleBattleSecondPassed(accessCode: number) {
        this.server.to(accessCode.toString()).emit(SocketEvents.SET_TIME, this.gameSocketRoomService.gameBattleRooms.get(accessCode).time);
    }

    handleBattleTimeOut(accessCode: number) {
        this.server.to(accessCode.toString()).emit(SocketEvents.AUTOMATIC_ATTACK);
    }

    endBattleTurn(accessCode: number) {
        this.playGameBoardBattleService.endBattleTurn(accessCode);
        this.handleBattleSecondPassed(accessCode);

        const playerTurn = this.playGameBoardBattleService.getPlayerBattleTurn(accessCode);
        this.startBattleTurn(accessCode, playerTurn);
    }

    handleBattleEndedByEscape(accessCode: number) {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        const firstPlayer = battleRoom.firstPlayerId;

        this.handleEndBattle(accessCode);
        this.server.to(accessCode.toString()).emit(SocketEvents.BATTLE_ENDED_BY_ESCAPE, firstPlayer);
        if (this.playGameBoardSocketService.getPlayerBySocketId(accessCode, firstPlayer).isVirtual) {
            setTimeout(() => {
                this.continueVirtualPlayerTurn(accessCode, firstPlayer);
            }, this.playGameBoardSocketService.getRandomDelay());
        }
    }

    handleBattleEndedByDeath(accessCode: number, winnerPlayer: string) {
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        const firstPlayer = battleRoom.firstPlayerId;
        const secondPlayer = battleRoom.secondPlayerId;

        this.handleEndBattle(accessCode);

        if (winnerPlayer === firstPlayer) {
            this.server.to(accessCode.toString()).emit(SocketEvents.FIRST_PLAYER_WON_BATTLE, { firstPlayer, loserPlayer: secondPlayer });
            this.playGameStatisticsService.increasePlayerStatistic(accessCode, firstPlayer, PlayerNumberStatisticType.FightWins);
            this.playGameStatisticsService.increasePlayerStatistic(accessCode, secondPlayer, PlayerNumberStatisticType.FightLoses);

            if (this.playGameBoardSocketService.getPlayerBySocketId(accessCode, firstPlayer).isVirtual) {
                this.server
                    .to(this.playGameBoardSocketService.getRandomClientInRoom(accessCode))
                    .emit(SocketEvents.VIRTUAL_PLAYER_WON_BATTLE, firstPlayer);
                setTimeout(() => {
                    this.continueVirtualPlayerTurn(accessCode, firstPlayer);
                }, this.playGameBoardSocketService.getRandomDelay());
            }
            if (this.playGameBoardSocketService.getPlayerBySocketId(accessCode, secondPlayer).isVirtual) {
                this.server
                    .to(this.playGameBoardSocketService.getRandomClientInRoom(accessCode))
                    .emit(SocketEvents.VIRTUAL_PLAYER_LOST_BATTLE, secondPlayer);
            }
        } else {
            this.server
                .to(accessCode.toString())
                .emit(SocketEvents.SECOND_PLAYER_WON_BATTLE, { winnerPlayer: secondPlayer, loserPlayer: firstPlayer });
            this.playGameStatisticsService.increasePlayerStatistic(accessCode, secondPlayer, PlayerNumberStatisticType.FightWins);
            this.playGameStatisticsService.increasePlayerStatistic(accessCode, firstPlayer, PlayerNumberStatisticType.FightLoses);

            if (this.playGameBoardSocketService.getPlayerBySocketId(accessCode, secondPlayer).isVirtual) {
                this.server
                    .to(this.playGameBoardSocketService.getRandomClientInRoom(accessCode))
                    .emit(SocketEvents.VIRTUAL_PLAYER_WON_BATTLE, secondPlayer);
            }
            if (this.playGameBoardSocketService.getPlayerBySocketId(accessCode, firstPlayer).isVirtual) {
                this.server
                    .to(this.playGameBoardSocketService.getRandomClientInRoom(accessCode))
                    .emit(SocketEvents.VIRTUAL_PLAYER_LOST_BATTLE, firstPlayer);
            }

            this.handleTimeOut(accessCode);
        }
    }

    handleEndBattle(accessCode: number) {
        this.playGameBoardBattleService.battleRoomFinished(accessCode);
        this.playGameBoardTimeService.resumeTimer(accessCode);
    }

    handleTimeOut(accessCode: number) {
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (!room) return;

        const gameTimer = this.gameSocketRoomService.gameTimerRooms.get(accessCode);
        switch (gameTimer.state) {
            case GameTimerState.ActiveTurn:
                this.endRoomTurn(accessCode);
                this.playGameBoardSocketService.changeTurn(accessCode);
                this.playGameBoardTimeService.setTimerPreparingTurn(accessCode);
                this.updateRoomTime(accessCode);
                break;

            case GameTimerState.PreparingTurn:
                this.startRoomTurn(accessCode, room.currentPlayerTurn);
                this.playGameBoardTimeService.setTimerActiveTurn(accessCode);
                this.updateRoomTime(accessCode);
                break;
        }
    }

    handlePlayerLeftRoom(accessCode: number, socketId: string) {
        const gameBoardRoom = this.gameSocketRoomService.gameBoardRooms.get(accessCode);
        const battleRoom = this.gameSocketRoomService.gameBattleRooms.get(accessCode);
        const room = this.gameSocketRoomService.getRoomByAccessCode(accessCode);
        if (!room) return;

        if (battleRoom) {
            if (battleRoom.firstPlayerId === socketId) {
                this.handleBattleEndedByDeath(accessCode, battleRoom.secondPlayerId);
            } else if (battleRoom.secondPlayerId === socketId) {
                this.handleBattleEndedByDeath(accessCode, battleRoom.firstPlayerId);
            }
        }

        if (gameBoardRoom) {
            if (room.currentPlayerTurn === socketId) {
                switch (this.gameSocketRoomService.gameTimerRooms.get(accessCode).state) {
                    case GameTimerState.ActiveTurn:
                        this.handleTimeOut(accessCode);
                        break;

                    case GameTimerState.PreparingTurn:
                        this.playGameBoardSocketService.changeTurn(accessCode);
                }
            }

            gameBoardRoom.spawnPlaces = gameBoardRoom.spawnPlaces.filter(([, id]) => id !== socketId);
            gameBoardRoom.turnOrder = gameBoardRoom.turnOrder.filter((id) => id !== socketId);

            if (gameBoardRoom.turnOrder.length === 1) {
                this.playGameBoardTimeService.pauseTimer(accessCode);
                this.server.to(accessCode.toString()).emit(SocketEvents.LAST_PLAYER_STANDING);
            } else {
                this.server.to(accessCode.toString()).emit(SocketEvents.GAME_BOARD_PLAYER_LEFT, socketId);
            }
        }
    }
}
