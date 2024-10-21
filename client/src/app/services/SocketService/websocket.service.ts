import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Subject } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket: any;
    private playersSubject = new Subject<PlayerCharacter[]>();

    constructor(private router: Router) {
        this.socket = io('http://localhost:3000');
        this.socket.on('updatePlayers', (players: PlayerCharacter[], roomId: string) => {
            this.playersSubject.next(players);
        });
        this.socket.on('roomCreated', (data: { accessCode: number }) => {
            console.log('Room created with access code:', data.accessCode);
        });
        this.socket.on('joinedRoom', (data: { message: string }) => {
            console.log('Joined room with code:', data.message);
        });
        this.socket.on('roomNotFound', (data: { message: string }) => {
            console.log('Room not found:', data.message);
        });
        this.socket.on('playerAdded', (data: { message: string }) => {
            console.log('Player added:', data.message);
        });
    }

    joinGame(accessCode: number) {
        console.log('Emitting joinGame with access code:', accessCode);
        this.socket.emit('joinGame', accessCode);
        this.socket.on('joinGameResponse', (response: { valid: boolean; message: string; roomId: string }) => {
            console.log('Received joinGameResponse:', response);
            if (response.valid) {
                // Si le code est valide, redirige
                this.router.navigate(['/player-create-character'], { queryParams: { roomId: response.roomId } });
            } else {
                // Gère le cas où le code n'est pas valide (par exemple, afficher un message d'erreur)
                console.error("Code d'accès invalide :", response.message);
                alert("Le code d'accès que vous avez entré est invalide.");
            }
        });
    }

    createGame(gameId: string | null, accessCode: number, player: PlayerCharacter) {
        const serializedPlayer = {
            name: player.name,
            avatar: player.avatar,
            attributes: {
                attack: player.attributes.attack,
                defense: player.attributes.defense,
                life: player.attributes.life,
                speed: player.attributes.speed,
            },
        };
        this.socket.emit('createGame', { gameId, accessCode, playerOrganizer: serializedPlayer });
        console.log('Emitting createGame event:', { gameId, accessCode, player: serializedPlayer });
    }

    addPlayerToRoom(gameId: string | null, player: PlayerCharacter) {
        const serializedPlayer = {
            name: player.name,
            avatar: player.avatar,
            attributes: {
                attack: player.attributes.attack,
                defense: player.attributes.defense,
                life: player.attributes.life,
                speed: player.attributes.speed,
            },
        };
        this.socket.emit('addPlayerToRoom', gameId, serializedPlayer);
        console.log('Emitting addPlayerToRoom event:', { gameId, player: serializedPlayer });
    }

    kickPlayer(playerId: string) {
        this.socket.emit('kickPlayer', playerId);
    }

    lockRoom() {
        this.socket.emit('lockRoom');
    }

    unlockRoom() {
        this.socket.emit('unlockRoom');
    }

    getPlayers(): Subject<any[]> {
        return this.playersSubject;
    }
}
