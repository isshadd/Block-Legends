export enum ChatEvents {
    Validate = 'validate',
    ValidateACK = 'validateWithAck',
    BroadcastAll = 'broadcastAll',
    JoinRoom = 'joinRoom',
    RoomMessage = 'roomMessage',
    EventMessage = 'eventMessage',
    TwoPlayerEvent = 'twoPlayerEvent',

    WordValidated = 'wordValidated',
    MassMessage = 'massMessage',
    EventReceived = 'eventReceived',
    Hello = 'hello',
    Clock = 'clock',
}
