import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { Subject } from 'rxjs';
import { PlayPageComponent } from './play-page.component';

describe('PlayPageComponent', () => {
    let component: PlayPageComponent;
    let fixture: ComponentFixture<PlayPageComponent>;
    let playGameBoardManagerServiceMock: jasmine.SpyObj<PlayGameBoardManagerService>;
    let playPageMouseHandlerServiceMock: jasmine.SpyObj<PlayPageMouseHandlerService>;
    let playGameBoardSocketServiceMock: jasmine.SpyObj<PlayGameBoardSocketService>;

    beforeEach(async () => {
        playGameBoardManagerServiceMock = jasmine.createSpyObj('PlayGameBoardManagerService', ['findPlayerFromSocketId'], {
            signalManagerFinishedInit$: new Subject(),
            userCurrentActionPoints: 5,
            areOtherPlayersInBattle: false,
            currentPlayerIdTurn: 'player1',
        });

        playPageMouseHandlerServiceMock = jasmine.createSpyObj('PlayPageMouseHandlerService', ['toggleAction']);
        playGameBoardSocketServiceMock = jasmine.createSpyObj('PlayGameBoardSocketService', ['endTurn']);

        await TestBed.configureTestingModule({
            imports: [PlayPageComponent],
            providers: [
                { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceMock },
                { provide: PlayPageMouseHandlerService, useValue: playPageMouseHandlerServiceMock },
                { provide: PlayGameBoardSocketService, useValue: playGameBoardSocketServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should handle onPlayGameBoardManagerInit correctly', () => {
        component.onPlayGameBoardManagerInit();

        expect(component.actionPoints).toBe(playGameBoardManagerServiceMock.userCurrentActionPoints);
        expect(component.isBattlePhase).toBe(playGameBoardManagerServiceMock.areOtherPlayersInBattle);
        expect(component.currentPlayer).toBe(
            playGameBoardManagerServiceMock.findPlayerFromSocketId(playGameBoardManagerServiceMock.currentPlayerIdTurn),
        );
    });

    it('should toggle action', () => {
        component.toggleAction();
        expect(playPageMouseHandlerServiceMock.toggleAction).toHaveBeenCalled();
    });

    it('should end turn', () => {
        component.endTurn();
        expect(playGameBoardSocketServiceMock.endTurn).toHaveBeenCalled();
    });
});
