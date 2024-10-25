import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MapComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        component.grid = [
            [{ isTerrain: () => false } as Tile, { isTerrain: () => true } as TerrainTile],
            [{ isTerrain: () => true, item: new DiamondSword() } as TerrainTile, { isTerrain: () => false } as Tile],
        ];
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit mapMouseEnter event on mouse enter', () => {
        spyOn(component.mapMouseEnter, 'emit');
        component.onMouseMapEnter();
        expect(component.mapMouseEnter.emit).toHaveBeenCalled();
    });

    it('should emit mapMouseLeave event on mouse leave', () => {
        spyOn(component.mapMouseLeave, 'emit');
        component.onMouseMapLeave();
        expect(component.mapMouseLeave.emit).toHaveBeenCalled();
    });

    it('should emit mapTileMouseDown event on mouse down with the correct arguments', () => {
        const mockEvent = new MouseEvent('mousedown');
        const mockTile = {} as Tile;
        spyOn(component.mapTileMouseDown, 'emit');
        component.onMouseDown(mockEvent, mockTile);
        expect(component.mapTileMouseDown.emit).toHaveBeenCalledWith({ event: mockEvent, tile: mockTile });
    });

    it('should emit mapTileMouseEnter event on tile mouse enter', () => {
        const mockTile = {} as Tile;
        spyOn(component.mapTileMouseEnter, 'emit');
        component.onMouseEnter(mockTile);
        expect(component.mapTileMouseEnter.emit).toHaveBeenCalledWith(mockTile);
    });

    it('should emit mapTileMouseMove event on tile mouse move', () => {
        const mockTile = {} as Tile;
        spyOn(component.mapTileMouseMove, 'emit');
        component.onMouseMove(mockTile);
        expect(component.mapTileMouseMove.emit).toHaveBeenCalledWith(mockTile);
    });

    it('should emit mapTileMouseLeave event on tile mouse leave', () => {
        const mockTile = {} as Tile;
        spyOn(component.mapTileMouseLeave, 'emit');
        component.onMouseLeave(mockTile);
        expect(component.mapTileMouseLeave.emit).toHaveBeenCalledWith(mockTile);
    });

    it('should emit mapTileMouseUp event on tile mouse up', () => {
        const mockTile = {} as Tile;
        spyOn(component.mapTileMouseUp, 'emit');
        component.onMouseUp(mockTile);
        expect(component.mapTileMouseUp.emit).toHaveBeenCalledWith(mockTile);
    });

    it('should prevent default context menu action', () => {
        const mockEvent = new MouseEvent('contextmenu');
        spyOn(mockEvent, 'preventDefault');
        component.onContextMenu(mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should return the item of a TerrainTile', () => {
        const terrainTile = component.grid[0][1] as TerrainTile;
        expect(component.getTerrainItem(terrainTile)).toEqual(terrainTile.item);
    });

    it('should return null if the tile is not terrain', () => {
        const tile = component.grid[0][0] as Tile;
        expect(component.getTerrainItem(tile)).toBeNull();
    });
});
