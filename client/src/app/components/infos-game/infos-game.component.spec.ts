import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfosGameComponent } from './infos-game.component';
import { Tile } from '@app/classes/Tiles/tile';

describe('InfosGameComponent', () => {
    let component: InfosGameComponent;
    let fixture: ComponentFixture<InfosGameComponent>;

    // Mock Tile for testing
    const mockTile: Tile = {
        // Add required Tile properties here based on your Tile class
    } as Tile;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InfosGameComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InfosGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Input properties', () => {
        it('should accept game input', () => {
            const testGame: Tile[][] = [[mockTile], [mockTile]];
            component.game = testGame;
            expect(component.game).toEqual(testGame);
        });

        it('should accept nbrPlayers input', () => {
            const testNbrPlayers = 4;
            component.nbrPlayers = testNbrPlayers;
            expect(component.nbrPlayers).toBe(testNbrPlayers);
        });

        it('should accept currentPlayer input', () => {
            const testCurrentPlayer = 'Player1';
            component.currentPlayer = testCurrentPlayer;
            expect(component.currentPlayer).toBe(testCurrentPlayer);
        });

        it('should handle game with empty arrays', () => {
            const emptyGame: Tile[][] = [];
            component.game = emptyGame;
            expect(component.game).toEqual(emptyGame);
        });

        it('should handle zero players', () => {
            component.nbrPlayers = 0;
            expect(component.nbrPlayers).toBe(0);
        });

        it('should handle empty string currentPlayer', () => {
            component.currentPlayer = '';
            expect(component.currentPlayer).toBe('');
        });
    });
});