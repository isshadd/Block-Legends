import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersListComponent } from './players-list.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;
    let playGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;

    const mockPlayerCharacter: PlayerCharacter = {
        socketId: 'test-socket-id',
        // Add other required PlayerCharacter properties here
    } as PlayerCharacter;

    beforeEach(async () => {
        // Create spy for the service
        playGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            currentPlayerIdTurn: 'test-socket-id'
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

    describe('Input properties', () => {
        it('should initialize players as empty array by default', () => {
            expect(component.players).toEqual([]);
        });

        it('should accept players input', () => {
            const testPlayers: PlayerCharacter[] = [mockPlayerCharacter];
            component.players = testPlayers;
            expect(component.players).toEqual(testPlayers);
        });
    });

    describe('isTurn', () => {
        it('should return true when player socketId matches currentPlayerIdTurn', () => {
            const player: PlayerCharacter = {
                socketId: 'test-socket-id',
                // Add other required PlayerCharacter properties here
            } as PlayerCharacter;

            const result = component.isTurn(player);
            expect(result).toBeTrue();
        });

        it('should return false when player socketId does not match currentPlayerIdTurn', () => {
            const player: PlayerCharacter = {
                socketId: 'different-socket-id',
                // Add other required PlayerCharacter properties here
            } as PlayerCharacter;

            const result = component.isTurn(player);
            expect(result).toBeFalse();
        });

        it('should handle undefined currentPlayerIdTurn', () => {
            // Reset the currentPlayerIdTurn to undefined
            Object.defineProperty(playGameBoardManagerService, 'currentPlayerIdTurn', {
                get: () => undefined
            });

            const player: PlayerCharacter = {
                socketId: 'test-socket-id',
                // Add other required PlayerCharacter properties here
            } as PlayerCharacter;

            const result = component.isTurn(player);
            expect(result).toBeFalse();
        });
    });
});