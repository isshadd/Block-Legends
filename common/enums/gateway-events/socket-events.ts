export const enum SocketEvents {
    // EMIS
    CREATE_GAME = 'createGame',
    JOIN_GAME = 'joinGame',
    ADD_PLAYER_TO_ROOM = 'addPlayerToRoom',
    KICK_PLAYER = 'kickPlayer',
    LEAVE_GAME = 'leaveGame',
    LOCK_ROOM = 'lockRoom',
    UNLOCK_ROOM = 'unlockRoom',
    START_GAME = 'startGame',
    GET_ROOM_STATE = 'getRoomState',
    GET_ROOM_PARAMETERS = 'getRoomParameters',
    INIT_GAME_BOARD = 'initGameBoard',
    USER_END_TURN = 'userEndTurn',
    USER_STARTED_MOVING = 'userStartedMoving',
    USER_FINISHED_MOVING = 'userFinishedMoving',
    USER_MOVED = 'userMoved',
    USER_RESPAWNED = 'userRespawned',
    ROOM_USER_RESPAWNED = 'roomUserRespawned',
    USER_DID_DOOR_ACTION = 'userDidDoorAction',
    USER_DID_BATTLE_ACTION = 'userDidBattleAction',
    USER_ATTACKED = 'userAttacked',
    USER_TRIED_ESCAPE = 'userTriedEscape',
    USER_WON = 'userWon',
    USER_GRABBED_ITEM = 'userGrabbedItem',
    USER_THREW_ITEM = 'userThrewItem',
    VIRTUAL_PLAYER_CHOOSED_DESTINATION = 'virtualPlayerChoosedDestination',
    VIRTUAL_PLAYER_MOVED = 'virtualPlayerMoved',
    VIRTUAL_PLAYER_CONTINUE_TURN = 'virtualPlayerContinueTurn',

    // RECUS
    ROOM_STATE = 'roomState',
    JOIN_GAME_RESPONSE = 'joinGameResponse',
    JOIN_WAITING_ROOM_SUCCESS = 'joinWaitingRoomSuccess',
    AVATAR_TAKEN_ERROR = 'avatarTakenError',
    JOIN_GAME_RESPONSE_CODE_INVALID = 'joinGameResponseCodeInvalid',
    JOIN_GAME_RESPONSE_LOCKED_ROOM = 'joinGameResponseLockedRoom',
    JOIN_GAME_RESPONSE_NO_MORE_EXISTING = 'joinGameResponseNoMoreExisting',
    JOIN_GAME_RESPONSE_LOCKED_AFTER_JOIN = 'joinGameResponseLockedAfterJoin',
    ROOM_LOCKED = 'roomLocked',
    ROOM_UNLOCKED = 'roomUnlocked',
    PLAYER_KICKED = 'playerKicked',
    PLAYER_LEFT = 'playerLeft',
    GAME_STARTED = 'gameStarted',
    ROOM_CLOSED = 'roomClosed',
    ERROR = 'error',
    CLOCK = 'clock',
    MASS_MESSAGE = 'massMessage',
    ORGANIZER_LEFT = 'organizerLeft',
    GAME_PARAMETERS = 'gameParameters',
    CLIENT_CONNECTED = 'clientConnected',
    CLIENT_DISCONNECTED = 'clientDisconnected',
    INIT_GAME_BOARD_PARAMETERS = 'initGameBoardParameters',
    ROOM_USER_MOVED = 'roomUserMoved',
    ROOM_USER_DID_DOOR_ACTION = 'roomUserDidDoorAction',
    ROOM_USER_DID_BATTLE_ACTION = 'roomUserDidBattleAction',
    OPPONENT_ATTACKED = 'opponentAttacked',
    SUCCESSFUL_ATTACK = 'successfulAttack',
    OPPONENT_TRIED_ESCAPE = 'opponentTriedEscape',
    GAME_BOARD_PLAYER_WON = 'gameBoardPlayerWon',
    SET_TIME = 'setTime',
    END_TIME = 'endTime',
    START_TURN = 'startTurn',
    START_VIRTUAL_PLAYER_TURN = 'startVirtualPlayerTurn',
    CONTINUE_VIRTUAL_PLAYER_TURN = 'continueVirtualPlayerTurn',
    START_TURN_BATTLE = 'startTurnBattle',
    START_VIRTUAL_PLAYER_BATTLE_TURN = 'startVirtualPlayerBattleTurn',
    AUTOMATIC_ATTACK = 'automaticAttack',
    BATTLE_ENDED_BY_ESCAPE = 'battleEndedByEscape',
    FIRST_PLAYER_WON_BATTLE = 'firstPlayerWonBattle',
    SECOND_PLAYER_WON_BATTLE = 'secondPlayerWonBattle',
    LAST_PLAYER_STANDING = 'lastPlayerStanding',
    GAME_BOARD_PLAYER_LEFT = 'gameBoardPlayerLeft',
    END_TURN = 'endTurn',
    START_BATTLE_TURN = 'startBattleTurn',
    ROOM_USER_GRABBED_ITEM = 'roomUserGrabbedItem',
    ROOM_USER_THREW_ITEM = 'roomUserThrewItem',
    VIRTUAL_PLAYER_WON_BATTLE = 'virtualPlayerWon',
    VIRTUAL_PLAYER_LOST_BATTLE = 'virtualPlayerLost',
}
