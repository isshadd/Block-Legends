import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { PlaceableEntityContainerComponent } from './placeable-entity-container.component';

describe('PlaceableEntityContainerComponent', () => {
    let component: PlaceableEntityContainerComponent;
    let fixture: ComponentFixture<PlaceableEntityContainerComponent>;
    let mapEditorManagerService: jasmine.SpyObj<MapEditorManagerService>;
    let gameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let mockEntity: PlaceableEntity;

    beforeEach(async () => {
        const mapEditorSpy = jasmine.createSpyObj('MapEditorManagerService', [
            'onMouseEnter',
            'onMouseLeave',
            'onMouseDownSideMenu',
            'startDrag',
            'endDrag',
        ]);
        const gameMapDataSpy = jasmine.createSpyObj('GameMapDataManagerService', ['']);

        await TestBed.configureTestingModule({
            imports: [PlaceableEntityContainerComponent],
            providers: [
                { provide: MapEditorManagerService, useValue: mapEditorSpy },
                { provide: GameMapDataManagerService, useValue: gameMapDataSpy },
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        mapEditorManagerService = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;
        gameMapDataManagerService = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;

        mockEntity = {
            description: 'Test Description',
            imageUrl: 'test-url',
            coordinates: { x: 0, y: 0 },
            visibleState: VisibleState.notSelected,
        };

        fixture = TestBed.createComponent(PlaceableEntityContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should inject gameMapDataManagerService', () => {
        expect(gameMapDataManagerService).toBeTruthy();
    });

    it('should call onMouseEnter on MapEditorManagerService when onMouseEnter is triggered', () => {
        component.onMouseEnter(mockEntity);
        expect(mapEditorManagerService.onMouseEnter).toHaveBeenCalledWith(mockEntity);
    });

    it('should call onMouseLeave on MapEditorManagerService when onMouseLeave is triggered', () => {
        component.onMouseLeave(mockEntity);
        expect(mapEditorManagerService.onMouseLeave).toHaveBeenCalledWith(mockEntity);
    });

    it('should call onMouseDownSideMenu on MapEditorManagerService when onMouseDown is triggered', () => {
        component.onMouseDown(mockEntity);
        expect(mapEditorManagerService.onMouseDownSideMenu).toHaveBeenCalledWith(mockEntity);
    });

    // it('should call startDrag on MapEditorManagerService when onDragStarted is triggered', () => {
    //     component.onDragStarted(mockEntity);
    //     expect(mapEditorManagerService.startDrag).toHaveBeenCalledWith(mockEntity);
    // });

    // it('should call endDrag on MapEditorManagerService when onDragEnded is triggered', () => {
    //     component.onDragEnded();
    //     expect(mapEditorManagerService.endDrag).toHaveBeenCalled();
    // });
});
