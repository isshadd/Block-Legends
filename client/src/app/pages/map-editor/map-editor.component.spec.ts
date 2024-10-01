import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
// eslint-disable-next-line max-len
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
        const mapEditorSpy = jasmine.createSpyObj('MapEditorManagerService', ['init', 'onMouseUpMapTile']);
        const gameMapDataSpy = jasmine.createSpyObj('GameMapDataManagerService', [
            'getLocalStorageIsNewGame',
            'getLocalStorageGameToEdit',
            'newGame',
            'loadGame',
        ]);
        const gameServerSpy = jasmine.createSpyObj('GameServerCommunicationService', ['getGame']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], { params: of({}) });

        await TestBed.configureTestingModule({
            imports: [MapEditorComponent],
            providers: [
                { provide: MapEditorManagerService, useValue: mapEditorSpy },
                { provide: GameMapDataManagerService, useValue: gameMapDataSpy },
                { provide: GameServerCommunicationService, useValue: gameServerSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
            ],
        }).compileComponents();

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

        fixture = TestBed.createComponent(MapEditorComponent);
        component = fixture.componentInstance;
        mapEditorManagerService = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;
        gameMapDataManagerService = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        gameServerCommunicationService = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        activatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should inject activatedRoute', () => {
        expect(activatedRoute).toBeTruthy();
    });

    it('should create a new game if isNewGame is true', () => {
        gameMapDataManagerService.getLocalStorageIsNewGame.and.returnValue(true);
        gameMapDataManagerService.getLocalStorageGameToEdit.and.returnValue(mockGame);

        fixture.detectChanges();

        expect(gameMapDataManagerService.newGame).toHaveBeenCalledWith(mockGame);
        expect(mapEditorManagerService.init).toHaveBeenCalled();
    });

    it('should load and edit an existing game if isNewGame is false and gameToEdit has _id', () => {
        gameMapDataManagerService.getLocalStorageIsNewGame.and.returnValue(false);
        gameMapDataManagerService.getLocalStorageGameToEdit.and.returnValue(mockGame);
        gameServerCommunicationService.getGame.and.returnValue(of(mockGame));

        fixture.detectChanges();

        expect(gameServerCommunicationService.getGame).toHaveBeenCalledWith(mockGame._id!);
        expect(gameMapDataManagerService.loadGame).toHaveBeenCalledWith(mockGame);
        expect(mapEditorManagerService.init).toHaveBeenCalled();
    });

    it('should navigate to /administration-game if isNewGame is false and gameToEdit does not have _id', () => {
        gameMapDataManagerService.getLocalStorageIsNewGame.and.returnValue(false);
        gameMapDataManagerService.getLocalStorageGameToEdit.and.returnValue({} as GameShared);

        fixture.detectChanges();

        expect(router.navigate).toHaveBeenCalledWith(['/administration-game']);
    });

    it('should call onMouseUpMapTile when onMouseUp is triggered', () => {
        component.onMouseUp();
        expect(mapEditorManagerService.onMouseUpMapTile).toHaveBeenCalled();
    });
});
