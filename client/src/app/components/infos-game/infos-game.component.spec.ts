import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { TileType } from '@common/enums/tile-type';
import { Vec2 } from '@common/interfaces/vec2';
import { InfosGameComponent } from './infos-game.component';

describe('InfosGameComponent', () => {
    let component: InfosGameComponent;
    let fixture: ComponentFixture<InfosGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InfosGameComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfosGameComponent);
        component = fixture.componentInstance;
        component.game = createTileGrid(2, 2);
        component.nbrPlayers = 2;
        component.currentPlayer = 'Player1';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have game input', () => {
        const game: Tile[][] = [
            [
                {
                    type: TileType.Grass,
                    description: 'Test tile',
                    imageUrl: 'path/to/image',
                    coordinates: { x: 0, y: 0 } as Vec2,
                    visibleState: VisibleState.Valid,
                    isItem: () => false,
                    isTerrain: () => true,
                    isWalkable: () => true,
                    isDoor: () => false,
                },
            ],
        ];

        component.game = game;
        fixture.detectChanges();
        expect(component.game).toEqual(game);
    });

    it('should have nbrPlayers input', () => {
        const nbrPlayers = 2;
        component.nbrPlayers = nbrPlayers;
        fixture.detectChanges();
        expect(component.nbrPlayers).toBe(nbrPlayers);
    });

    it('should have currentPlayer input', () => {
        const currentPlayer = 'Player1';
        component.currentPlayer = currentPlayer;
        fixture.detectChanges();
        expect(component.currentPlayer).toBe(currentPlayer);
    });
});
function createTileGrid(rows: number, cols: number): Tile[][] {
    const grid: Tile[][] = [];

    for (let row = 0; row < rows; row++) {
        const rowTiles: Tile[] = [];
        for (let col = 0; col < cols; col++) {
            const tile = new Tile();
            tile.coordinates = { x: col, y: row }; // Initialisation des coordonnées pour chaque tuile
            rowTiles.push(tile);
        }
        grid.push(rowTiles);
    }

    return grid;
}
