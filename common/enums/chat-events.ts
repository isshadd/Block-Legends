export enum ChatEvents {
    Validate = 'validate',
    ValidateACK = 'validateWithAck',
    BroadcastAll = 'broadcastAll',
    JoinRoom = 'joinRoom',
    RoomMessage = 'roomMessage',
    EventMessage = 'eventMessage',

    WordValidated = 'wordValidated',
    MassMessage = 'massMessage',
    EventReceived = 'eventReceived',
    Hello = 'hello',
    Clock = 'clock',
}
