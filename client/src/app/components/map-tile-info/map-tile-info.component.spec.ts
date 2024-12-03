import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { TileType } from '@common/enums/tile-type';
import { MapTileInfoComponent } from './map-tile-info.component';

describe('MapTileInfoComponent', () => {
    let component: MapTileInfoComponent;
    let fixture: ComponentFixture<MapTileInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MapTileInfoComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MapTileInfoComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return the correct image path for tileTypeToImage', () => {
        const tileType = TileType.Grass;
        const expectedPath = `/assets/images/tiles/blocks/${tileType}.png`;

        expect(component.tileTypeToImage(tileType)).toBe(expectedPath);
    });

    it('should emit close event when closePanel is called', () => {
        spyOn(component.closePanel, 'emit');

        component.closePanel();

        expect(component.closePanel.emit).toHaveBeenCalled();
    });

    it('should return the movement cost for a terrain tile in tileMovementCost', () => {
        const terrainTile = new TerrainTile();
        spyOn(terrainTile, 'isTerrain').and.returnValue(true);

        expect(component.tileMovementCost(terrainTile)).toBe(1);
    });

    it('should return null for a non-terrain tile in tileMovementCost', () => {
        const nonTerrainTile = new Tile();
        spyOn(nonTerrainTile, 'isTerrain').and.returnValue(false);

        expect(component.tileMovementCost(nonTerrainTile)).toBeNull();
    });
});
