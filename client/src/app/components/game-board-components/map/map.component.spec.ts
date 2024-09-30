import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiamondSword } from '@app/classes/Items/diamond-sword';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { MapComponent } from './map.component';

describe('MapComponent', () => {
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;
    let mapEditorManagerService: jasmine.SpyObj<MapEditorManagerService>;
    let gameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let tile: GrassTile;

    beforeEach(async () => {
        const mapEditorSpy = jasmine.createSpyObj('MapEditorManagerService', [
            'onMouseDownMapTile',
            'onMouseEnter',
            'onMouseMoveMapTile',
            'onMouseLeave',
            'itemPlacer',
        ]);
        const gameMapDataSpy = jasmine.createSpyObj('GameMapDataManagerService', ['']);

        await TestBed.configureTestingModule({
            imports: [MapComponent],
            providers: [
                { provide: MapEditorManagerService, useValue: mapEditorSpy },
                { provide: GameMapDataManagerService, useValue: gameMapDataSpy },
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        mapEditorManagerService = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;
        gameMapDataManagerService = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;

        tile = new GrassTile();

        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return the current grid when getGrid is called', () => {
        const mockGrid = [
            [new GrassTile(), new GrassTile()],
            [new GrassTile(), new GrassTile()],
        ];
        gameMapDataManagerService.currentGrid = mockGrid;

        const result = component.getGrid();
        expect(result).toBe(mockGrid);
    });

    it('should call onMouseDownMapTile when onMouseDown is triggered', () => {
        const event = new MouseEvent('mousedown');

        component.onMouseDown(event, tile);
        expect(mapEditorManagerService.onMouseDownMapTile).toHaveBeenCalledWith(event, tile);
    });

    it('should call onMouseEnter when onMouseEnter is triggered', () => {
        component.onMouseEnter(tile);
        expect(mapEditorManagerService.onMouseEnter).toHaveBeenCalledWith(tile);
    });

    it('should call onMouseMoveMapTile when onMouseMove is triggered', () => {
        component.onMouseMove(tile);
        expect(mapEditorManagerService.onMouseMoveMapTile).toHaveBeenCalledWith(tile);
    });

    it('should call onMouseLeave when onMouseLeave is triggered', () => {
        component.onMouseLeave(tile);
        expect(mapEditorManagerService.onMouseLeave).toHaveBeenCalledWith(tile);
    });

    it('should prevent default action when onContextMenu is triggered', () => {
        const event = new MouseEvent('contextmenu');
        spyOn(event, 'preventDefault');

        component.onContextMenu(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call itemPlacer when onDrop is triggered with a dragged item', () => {
        const draggedItem: DiamondSword = new DiamondSword();
        mapEditorManagerService.draggedEntity = draggedItem;

        component.onDrop(tile);
        expect(mapEditorManagerService.itemPlacer).toHaveBeenCalledWith(draggedItem, tile);
    });

    it('should not call itemPlacer when onDrop is triggered with no dragged item', () => {
        mapEditorManagerService.draggedEntity = null;

        component.onDrop(tile);
        expect(mapEditorManagerService.itemPlacer).not.toHaveBeenCalled();
    });
});
