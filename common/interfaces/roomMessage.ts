export interface RoomMessage {
    room: string;
    time : Date;
    sender: string; 
    content: string;
}

export interface RoomMessageReceived extends RoomMessage {
    senderId: string;
}