import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { of, Subject } from 'rxjs';
import { PlayPageComponent } from './play-page.component';

describe('PlayPageComponent', () => {
    let component: PlayPageComponent;
    let fixture: ComponentFixture<PlayPageComponent>;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;
    let playPageMouseHandlerServiceSpy: jasmine.SpyObj<PlayPageMouseHandlerService>;
    let playGameBoardSocketServiceSpy: jasmine.SpyObj<PlayGameBoardSocketService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let signalSubject: Subject<void>;

    beforeEach(async () => {
        // Création d'un Subject pour simuler le signal d'initialisation
        signalSubject = new Subject<void>();

        // Configuration des mocks
        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', {
            turnOrder: ['player1', 'player2'],
            userCurrentActionPoints: 5,
            isBattleOn: false,
            findPlayerFromSocketId: jasmine.createSpy().and.callFake((socketId) => {
                return socketId === 'player1' ? { name: 'player1', attributes: { life: 10 } } : null;
            }),
        });

        playGameBoardManagerServiceSpy.signalManagerFinishedInit$ = signalSubject.asObservable();

        playPageMouseHandlerServiceSpy = jasmine.createSpyObj('PlayPageMouseHandlerService', [
            'onMapTileMouseDown',
            'onMapTileMouseEnter',
            'onMapTileMouseLeave',
            'discardRightClickSelecterPlayer',
            'discardRightSelectedTile',
            'toggleAction',
        ]);

        playGameBoardSocketServiceSpy = jasmine.createSpyObj('PlayGameBoardSocketService', ['init', 'endTurn', 'leaveGame']);
        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', {
            players$: of([{ name: 'player1', attributes: { life: 10 } }]),
            getTotalPlayers: jasmine.createSpy().and.returnValue([{ name: 'player1', attributes: { life: 10 } }]),
        });

        gameServiceSpy = jasmine.createSpyObj('GameService', {
            currentPlayer$: of({ name: 'player1', attributes: { life: 10 } }),
        });

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [PlayPageComponent],
            providers: [
                { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy },
                { provide: PlayPageMouseHandlerService, useValue: playPageMouseHandlerServiceSpy },
                { provide: PlayGameBoardSocketService, useValue: playGameBoardSocketServiceSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: ActivatedRoute, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayPageComponent);
        component = fixture.componentInstance;

        // Initialisation du composant
        component.ngOnInit();
    });

    it('should subscribe to signalManagerFinishedInit$', fakeAsync(() => {
        const spy = spyOn(playGameBoardManagerServiceSpy.signalManagerFinishedInit$, 'subscribe');

        // Simuler l'émission du signal
        signalSubject.next();
        tick(); // Appliquer une temporisation simulée

        // Vérifiez si subscribe a été appelé
        expect(spy).toHaveBeenCalled();
    }));

    it('should correctly initialize player data on PlayGameBoardManager init', fakeAsync(() => {
        // Simuler l'émission du signal d'initialisation
        signalSubject.next();
        tick();

        // Vérifiez que la méthode de traitement de l'initialisation est appelée
        expect(component.actionPoints).toBe(5);
        expect(component.isBattlePhase).toBe(false);
        expect(component.currentPlayer).toEqual({ name: 'player1', attributes: { life: 10 } } as unknown as PlayerCharacter);
        expect(component.players.length).toBe(1);
        expect(component.players[0]).toEqual({ name: 'player1', attributes: { life: 10 } } as unknown as PlayerCharacter);
    }));

    it('should update players list when players$ observable emits', fakeAsync(() => {
        const updatedPlayers = [
            { name: 'player1', attributes: { life: 10 } }as unknown as PlayerCharacter,
            { name: 'player2', attributes: { life: 5 } }as unknown as PlayerCharacter,
        ];
        (webSocketServiceSpy.players$ as unknown as jasmine.Spy).and.returnValue(of(updatedPlayers));

        component.ngOnInit(); // Réinitialiser l'abonnement

        // Simuler l'émission de joueurs mis à jour
        signalSubject.next();
        tick();

        expect(component.actualPlayers).toEqual(updatedPlayers);
        expect(component.players.length).toBe(2);
    }));
});
