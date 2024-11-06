import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersListComponent } from './players-list.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;
    let playGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;

    // Mock player data
    const mockPlayers: PlayerCharacter[] = [
        { socketId: 'player1', name: 'Player 1' } as PlayerCharacter,
        { socketId: 'player2', name: 'Player 2' } as PlayerCharacter
    ];

    beforeEach(async () => {
        // Create spy for PlayGameBoardManagerService
        playGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            currentPlayerIdTurn: 'player1'
        });

        await TestBed.configureTestingModule({
            imports: [PlayersListComponent],
            providers: [
                { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PlayersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with empty players array by default', () => {
        const newComponent = new PlayersListComponent(playGameBoardManagerService);
        expect(newComponent.players).toEqual([]);
    });

    it('should accept players input', () => {
        component.players = mockPlayers;
        expect(component.players).toEqual(mockPlayers);
    });

    describe('isTurn', () => {
        beforeEach(() => {
            component.players = mockPlayers;
        });

        it('should return true when player socketId matches currentPlayerIdTurn', () => {
            const result = component.isTurn(mockPlayers[0]); // player1
            expect(result).toBeTrue();
        });

        it('should return false when player socketId does not match currentPlayerIdTurn', () => {
            const result = component.isTurn(mockPlayers[1]); // player2
            expect(result).toBeFalse();
        });

        it('should handle different currentPlayerIdTurn values', () => {
            // Change the currentPlayerIdTurn
            Object.defineProperty(playGameBoardManagerService, 'currentPlayerIdTurn', {
                get: () => 'player2'
            });

            expect(component.isTurn(mockPlayers[0])).toBeFalse(); // player1
            expect(component.isTurn(mockPlayers[1])).toBeTrue(); // player2
        });
    });
});