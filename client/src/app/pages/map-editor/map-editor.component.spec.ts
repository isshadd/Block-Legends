import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { MapEditorComponent } from './map-editor.component';

describe('MapEditorComponent', () => {
    let component: MapEditorComponent;
    let fixture: ComponentFixture<MapEditorComponent>;
    let mapEditorManagerService: jasmine.SpyObj<MapEditorManagerService>;
    let gameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let gameServerCommunicationService: jasmine.SpyObj<GameServerCommunicationService>;
    let router: jasmine.SpyObj<Router>;
    let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

    let mockGame: GameShared;

    beforeEach(async () => {
        mapEditorManagerService = jasmine.createSpyObj('MapEditorManagerService', ['init', 'onMouseUpMapTile']);
        gameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
            'getLocalStorageIsNewGame',
            'getLocalStorageGameToEdit',
            'newGame',
            'loadGame',
            'hasValidNameAndDescription',
            'isSavedGame',
        ]);
        gameServerCommunicationService = jasmine.createSpyObj('GameServerCommunicationService', ['getGame']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        activatedRoute = jasmine.createSpyObj('ActivatedRoute', [], { params: of({}) });

        mockGame = {
            _id: 'gameId',
            name: 'Test Game',
            description: 'Test Description',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'image.jpg',
            isVisible: true,
            tiles: [],
        };
    });

    const createComponent = async () => {
        await TestBed.configureTestingModule({
            imports: [MapEditorComponent],
            providers: [
                { provide: MapEditorManagerService, useValue: mapEditorManagerService },
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerService },
                { provide: GameServerCommunicationService, useValue: gameServerCommunicationService },
                { provide: Router, useValue: router },
                { provide: ActivatedRoute, useValue: activatedRoute },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MapEditorComponent);
        component = fixture.componentInstance;
        mapEditorManagerService = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;
        gameMapDataManagerService = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        gameMapDataManagerService.currentGrid = [];
        gameServerCommunicationService = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    };

    it('should create the component', async () => {
        gameMapDataManagerService.getLocalStorageIsNewGame.and.returnValue(true);
        gameMapDataManagerService.getLocalStorageGameToEdit.and.returnValue(mockGame);

        await createComponent();
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should inject activatedRoute', async () => {
        await createComponent();
        fixture.detectChanges();

        expect(activatedRoute).toBeTruthy();
        expect(component).toBeTruthy();
    });

    it('should create a new game if isNewGame is true', async () => {
        gameMapDataManagerService.getLocalStorageIsNewGame.and.returnValue(true);
        gameMapDataManagerService.getLocalStorageGameToEdit.and.returnValue(mockGame);

        await createComponent();
        fixture.detectChanges();

        expect(gameMapDataManagerService.newGame).toHaveBeenCalledWith(mockGame);
        expect(mapEditorManagerService.init).toHaveBeenCalled();
        expect(component).toBeTruthy();
    });

    it('should load and edit an existing game if isNewGame is false and gameToEdit has _id', async () => {
        gameMapDataManagerService.getLocalStorageIsNewGame.and.returnValue(false);
        gameMapDataManagerService.getLocalStorageGameToEdit.and.returnValue(mockGame);
        gameServerCommunicationService.getGame.and.returnValue(of(mockGame));

        await createComponent();
        fixture.detectChanges();

        expect(gameServerCommunicationService.getGame).toHaveBeenCalledWith(mockGame._id!);
        expect(gameMapDataManagerService.loadGame).toHaveBeenCalledWith(mockGame);
        expect(mapEditorManagerService.init).toHaveBeenCalled();
        expect(component).toBeTruthy();
    });

    it('should navigate to /administration-game if isNewGame is false and gameToEdit does not have _id', async () => {
        gameMapDataManagerService.getLocalStorageIsNewGame.and.returnValue(false);
        gameMapDataManagerService.getLocalStorageGameToEdit.and.returnValue({} as GameShared);

        await createComponent();
        fixture.detectChanges();

        expect(router.navigate).toHaveBeenCalledWith(['/administration-game']);
        expect(component).toBeTruthy();
    });

    it('should call onMouseUpMapTile when onMouseUp is triggered', async () => {
        gameMapDataManagerService.getLocalStorageIsNewGame.and.returnValue(true);
        gameMapDataManagerService.getLocalStorageGameToEdit.and.returnValue(mockGame);

        await createComponent();
        fixture.detectChanges();

        component.onMouseUp();
        expect(mapEditorManagerService.onMouseUpMapTile).toHaveBeenCalled();
        expect(component).toBeTruthy();
    });
});
