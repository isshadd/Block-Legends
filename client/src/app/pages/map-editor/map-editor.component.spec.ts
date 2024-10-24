import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { GameServerCommunicationService } from '@app/services/game-server-communication.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { MapEditorComponent } from './map-editor.component';

describe('MapEditorComponent', () => {
    let component: MapEditorComponent;
    let fixture: ComponentFixture<MapEditorComponent>;

    let routerSpy: jasmine.SpyObj<Router>;
    let mapEditorManagerServiceSpy: jasmine.SpyObj<MapEditorManagerService>;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let gameServerCommunicationServiceSpy: jasmine.SpyObj<GameServerCommunicationService>;

    const emptyGame: GameShared = {
        name: '',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        imageUrl: '',
        isVisible: false,
        tiles: [],
    };

    const existingGame: GameShared = {
        _id: 'game123',
        name: 'Existing Game',
        description: 'Description',
        size: MapSize.SMALL,
        mode: GameMode.CTF,
        imageUrl: '',
        isVisible: false,
        tiles: [[{ type: TileType.Grass }], [{ type: TileType.Grass }]],
    };

    beforeEach(async () => {
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        const mapEditorManagerServiceSpyObj = jasmine.createSpyObj('MapEditorManagerService', [
            'init',
            'mapItemCheckup',
            'onMouseUp',
            'onMapMouseEnter',
            'onMapMouseLeave',
            'onMouseUpMapTile',
            'getDraggedItem',
            'onMouseDownMapTile',
            'onMouseEnter',
            'onMouseMoveMapTile',
            'onMouseLeave',
        ]);
        const gameMapDataManagerServiceSpyObj = jasmine.createSpyObj('GameMapDataManagerService', [
            'getLocalStorageIsNewGame',
            'getLocalStorageGameToEdit',
            'init',
            'getCurrentGrid',
        ]);
        const gameServerCommunicationServiceSpyObj = jasmine.createSpyObj('GameServerCommunicationService', ['getGame']);

        await TestBed.configureTestingModule({
            imports: [MapEditorComponent],
            providers: [
                { provide: Router, useValue: routerSpyObj },
                { provide: ActivatedRoute, useValue: {} },
                { provide: MapEditorManagerService, useValue: mapEditorManagerServiceSpyObj },
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerServiceSpyObj },
                { provide: GameServerCommunicationService, useValue: gameServerCommunicationServiceSpyObj },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        mapEditorManagerServiceSpy = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;
        gameMapDataManagerServiceSpy = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        gameServerCommunicationServiceSpy = TestBed.inject(GameServerCommunicationService) as jasmine.SpyObj<GameServerCommunicationService>;

        gameMapDataManagerServiceSpy.getCurrentGrid.and.returnValue([]);
        gameMapDataManagerServiceSpy.getLocalStorageIsNewGame.and.returnValue(false);
        gameMapDataManagerServiceSpy.getLocalStorageGameToEdit.and.returnValue(existingGame);
        gameServerCommunicationServiceSpy.getGame.and.returnValue(of(existingGame));

        fixture = TestBed.createComponent(MapEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should initialize services correctly for a new game', () => {
            gameMapDataManagerServiceSpy.getLocalStorageIsNewGame.and.returnValue(true);
            gameMapDataManagerServiceSpy.getLocalStorageGameToEdit.and.returnValue(emptyGame);

            fixture = TestBed.createComponent(MapEditorComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(component).toBeTruthy();
            expect(gameMapDataManagerServiceSpy.getLocalStorageIsNewGame).toHaveBeenCalled();
            expect(gameMapDataManagerServiceSpy.getLocalStorageGameToEdit).toHaveBeenCalled();
            expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(emptyGame);
            expect(mapEditorManagerServiceSpy.init).toHaveBeenCalled();
        });

        it('should initialize services correctly for editing an existing game', () => {
            expect(gameServerCommunicationServiceSpy.getGame).toHaveBeenCalledWith(existingGame._id);
            expect(gameMapDataManagerServiceSpy.init).toHaveBeenCalledWith(existingGame);
            expect(mapEditorManagerServiceSpy.init).toHaveBeenCalled();
            expect(mapEditorManagerServiceSpy.mapItemCheckup).toHaveBeenCalled();
        });

        it('should navigate to /administration-game if gameToEdit is invalid', () => {
            gameMapDataManagerServiceSpy.getLocalStorageGameToEdit.and.returnValue(emptyGame);

            fixture = TestBed.createComponent(MapEditorComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['/administration-game']);
        });
    });
});
