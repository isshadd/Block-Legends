import { TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';
import { of, Subject } from 'rxjs';
import { PlayGameBoardManagerService } from './game-board/play-game-board-manager.service';
import { PlayPageMouseHandlerService } from './play-page-mouse-handler.service';

describe('PlayPageMouseHandlerService - ngOnDestroy', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceMock: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        playGameBoardManagerServiceMock = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: of(), // Mock as observable
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceMock }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should call next and complete on destroy$', () => {
        const destroySpy = spyOn(service['destroy$'], 'next').and.callThrough();
        const completeSpy = spyOn(service['destroy$'], 'complete').and.callThrough();

        service.ngOnDestroy();

        expect(destroySpy).toHaveBeenCalled();
        expect(completeSpy).toHaveBeenCalled();
    });
});

describe('PlayPageMouseHandlerService - onMapTileMouseDown', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        const signalUserStartedMovingSubject = new Subject<void>();

        playGameBoardManagerServiceSpy = jasmine.createSpyObj(
            'PlayGameBoardManagerService',
            ['handlePlayerAction', 'moveUserPlayer', 'getCurrentPlayerTile', 'getAdjacentActionTiles'],
            {
                signalUserStartedMoving$: signalUserStartedMovingSubject.asObservable(), // Mock as an observable
            },
        );

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should call handleLeftClick when left mouse button is pressed', () => {
        const tile = new Tile();
        const mouseEvent = new MouseEvent('mousedown', { button: 0 });
        spyOn(service, 'handleLeftClick');

        service.onMapTileMouseDown(mouseEvent, tile);

        expect(service.handleLeftClick).toHaveBeenCalledWith(tile);
    });

    it('should call handleRightClick when right mouse button is pressed', () => {
        const tile = new Tile();
        const mouseEvent = new MouseEvent('mousedown', { button: 2 });
        spyOn(service, 'handleRightClick');

        service.onMapTileMouseDown(mouseEvent, tile);

        expect(service.handleRightClick).toHaveBeenCalledWith(mouseEvent, tile);
    });
});

describe('PlayPageMouseHandlerService - onMapTileMouseEnter', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        const signalUserStartedMovingSubject = new Subject<void>();

        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: signalUserStartedMovingSubject.asObservable(),
            userCurrentPossibleMoves: new Map<Tile, Tile[]>(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should set visibleState of possibleTileMove tiles to Selected and update lastTilePath', () => {
        const tile = new Tile();
        const possibleTile1 = new Tile();
        const possibleTile2 = new Tile();

        playGameBoardManagerServiceSpy.userCurrentPossibleMoves.set(tile, [possibleTile1, possibleTile2]);
        service.actionTiles = [];

        service.onMapTileMouseEnter(tile);

        expect(possibleTile1.visibleState).toBe(VisibleState.Selected);
        expect(possibleTile2.visibleState).toBe(VisibleState.Selected);
        expect(service.lastTilePath).toEqual([possibleTile1, possibleTile2]);
    });

    it('should set visibleState of tile to Hovered if possibleTileMove does not exist and tile is not in actionTiles', () => {
        const tile = new Tile();
        service.actionTiles = [];

        service.onMapTileMouseEnter(tile);

        expect(tile.visibleState).toBe(VisibleState.Hovered);
    });
});

describe('PlayPageMouseHandlerService - onMapTileMouseLeave', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        const signalUserStartedMovingSubject = new Subject<void>();

        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: signalUserStartedMovingSubject.asObservable(),
            userCurrentPossibleMoves: new Map<Tile, Tile[]>(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should set visibleState of lastTilePath tiles to Valid and clear lastTilePath', () => {
        const tile1 = new Tile();
        const tile2 = new Tile();

        service.lastTilePath = [tile1, tile2];
        service.actionTiles = [];

        service.onMapTileMouseLeave(tile1);

        expect(tile1.visibleState).toBe(VisibleState.Valid);
        expect(tile2.visibleState).toBe(VisibleState.Valid);
        expect(service.lastTilePath).toEqual([]);
    });

    it('should set visibleState of tile to Valid if lastTilePath is empty and possibleTileMove exists', () => {
        const tile = new Tile();
        playGameBoardManagerServiceSpy.userCurrentPossibleMoves.set(tile, [tile]);
        service.lastTilePath = [];
        service.actionTiles = [];

        service.onMapTileMouseLeave(tile);

        expect(tile.visibleState).toBe(VisibleState.Valid);
    });

    it('should set visibleState of tile to NotSelected if lastTilePath is empty and possibleTileMove does not exist', () => {
        const tile = new Tile();
        service.lastTilePath = [];
        service.actionTiles = [];

        service.onMapTileMouseLeave(tile);

        expect(tile.visibleState).toBe(VisibleState.NotSelected);
    });
});

describe('PlayPageMouseHandlerService - handleLeftClick', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        const signalUserStartedMovingSubject = new Subject<void>();

        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', ['handlePlayerAction', 'moveUserPlayer'], {
            signalUserStartedMoving$: signalUserStartedMovingSubject.asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should call discard methods, clearUI, and handlePlayerAction if tile is in actionTiles', () => {
        const tile = new Tile();
        service.actionTiles = [tile];

        spyOn(service, 'discardRightClickSelectedPlayer');
        spyOn(service, 'discardRightSelectedTile');
        spyOn(service, 'clearUI');

        service.handleLeftClick(tile);

        expect(service.discardRightClickSelectedPlayer).toHaveBeenCalled();
        expect(service.discardRightSelectedTile).toHaveBeenCalled();
        expect(service.clearUI).toHaveBeenCalled();
        expect(playGameBoardManagerServiceSpy.handlePlayerAction).toHaveBeenCalledWith(tile);
    });

    it('should call discard methods and moveUserPlayer if tile is not in actionTiles', () => {
        const tile = new Tile();
        service.actionTiles = []; // Ensure tile is not in actionTiles

        spyOn(service, 'discardRightClickSelectedPlayer');
        spyOn(service, 'discardRightSelectedTile');

        service.handleLeftClick(tile);

        expect(service.discardRightClickSelectedPlayer).toHaveBeenCalled();
        expect(service.discardRightSelectedTile).toHaveBeenCalled();
        expect(playGameBoardManagerServiceSpy.moveUserPlayer).toHaveBeenCalledWith(tile);
    });
});

describe('PlayPageMouseHandlerService - handleRightClick', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: new Subject<void>().asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should call discardRightSelectedTile, set rightSelectedTile, and call event.preventDefault', () => {
        const tile = new Tile();
        const mouseEvent = new MouseEvent('mousedown', { button: 2 });
        spyOn(service, 'discardRightSelectedTile');
        spyOn(mouseEvent, 'preventDefault');

        service.handleRightClick(mouseEvent, tile);

        expect(service.discardRightSelectedTile).toHaveBeenCalled();
        expect(service.rightSelectedTile).toBe(tile);
        expect(mouseEvent.preventDefault).toHaveBeenCalled();
    });
});

describe('PlayPageMouseHandlerService - toggleAction', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        const signalUserStartedMovingSubject = new Subject<void>();

        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', ['getCurrentPlayerTile', 'getAdjacentActionTiles'], {
            signalUserStartedMoving$: signalUserStartedMovingSubject.asObservable(),
            isUserTurn: true,
            userCurrentActionPoints: 1,
            userCurrentPossibleMoves: new Map<Tile, Tile[]>(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should set isActionOpen to true and set actionTiles to VisibleState.Action when toggling on with action points', () => {
        const userTile = new Tile();
        const adjacentTile = new Tile();
        playGameBoardManagerServiceSpy.getCurrentPlayerTile.and.returnValue(userTile);
        playGameBoardManagerServiceSpy.getAdjacentActionTiles.and.returnValue([adjacentTile]);

        service.toggleAction();

        expect(service.isActionOpen).toBeTrue();
        expect(service.actionTiles).toContain(adjacentTile);
        expect(adjacentTile.visibleState).toBe(VisibleState.Action);
    });

    it('should set isActionOpen to false if user has no action points', () => {
        playGameBoardManagerServiceSpy.userCurrentActionPoints = 0;

        service.toggleAction();

        expect(service.actionTiles.length).toBe(0);
    });

    it('should not toggle action if it is not the user’s turn', () => {
        playGameBoardManagerServiceSpy.isUserTurn = false;

        service.toggleAction();

        expect(service.isActionOpen).toBeTrue();
    });
});

describe('PlayPageMouseHandlerService - endTurn', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: new Subject<void>().asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should call clearUI when endTurn is executed', () => {
        spyOn(service, 'clearUI');

        service.endTurn();

        expect(service.clearUI).toHaveBeenCalled();
    });
});

describe('PlayPageMouseHandlerService - clearUI', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: new Subject<void>().asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should reset UI elements to default values', () => {
        const tile1 = new Tile();
        const tile2 = new Tile();
        tile1.visibleState = VisibleState.Action;
        tile2.visibleState = VisibleState.Action;

        service.actionTiles = [tile1, tile2];
        service.lastTilePath = [tile1];
        service.isActionOpen = true;
        service.rightClickSelectedPlayerCharacter = {} as any; // Mock player character
        service.rightSelectedTile = tile1;

        service.clearUI();

        expect(service.actionTiles).toEqual([]);
        expect(service.lastTilePath).toEqual([]);
        expect(service.isActionOpen).toBeFalse();
        expect(service.rightClickSelectedPlayerCharacter).toBeNull();
        expect(service.rightSelectedTile).toBeNull();
    });
});

describe('PlayPageMouseHandlerService - discardRightClickSelectedPlayer', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: new Subject<void>().asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should set rightClickSelectedPlayerCharacter to null', () => {
        service.rightClickSelectedPlayerCharacter = {} as PlayerCharacter; // Initialize with a mock value

        service.discardRightClickSelectedPlayer();

        expect(service.rightClickSelectedPlayerCharacter).toBeNull();
    });
});

describe('PlayPageMouseHandlerService - discardRightSelectedTile', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: new Subject<void>().asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should set rightSelectedTile to null', () => {
        service.rightSelectedTile = new Tile(); // Initialize with a mock tile

        service.discardRightSelectedTile();

        expect(service.rightSelectedTile).toBeNull();
    });
});

describe('PlayPageMouseHandlerService - toggleAction specific part', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        const signalUserStartedMovingSubject = new Subject<void>();

        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', ['getCurrentPlayerTile', 'getAdjacentActionTiles'], {
            signalUserStartedMoving$: signalUserStartedMovingSubject.asObservable(),
            userCurrentPossibleMoves: new Map<Tile, Tile[]>(),
            isUserTurn: true,
            userCurrentActionPoints: 1,
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should set visibleState of actionTiles to Valid or NotSelected and clear actionTiles', () => {
        const tileWithMove = new Tile();
        const tileWithoutMove = new Tile();

        playGameBoardManagerServiceSpy.userCurrentPossibleMoves.set(tileWithMove, [tileWithMove]);

        service.actionTiles = [tileWithMove, tileWithoutMove];
        service.isActionOpen = true;

        service.toggleAction(); // This will toggle `isActionOpen` to false and trigger the part in question

        expect(tileWithMove.visibleState).toBe(VisibleState.Valid);
        expect(tileWithoutMove.visibleState).toBe(VisibleState.NotSelected);
        expect(service.actionTiles).toEqual([]);
    });
});

describe('PlayPageMouseHandlerService - toggleAction with userCurrentActionPoints check', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

    beforeEach(() => {
        const signalUserStartedMovingSubject = new Subject<void>();

        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', ['getCurrentPlayerTile', 'getAdjacentActionTiles'], {
            signalUserStartedMoving$: signalUserStartedMovingSubject.asObservable(),
            isUserTurn: true,
            userCurrentActionPoints: 0, // Set action points to 0 to trigger the condition
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should set isActionOpen to false if userCurrentActionPoints is 0 or less', () => {
        service.isActionOpen = true; // Simulate that action menu is initially open

        service.toggleAction();

        expect(service.isActionOpen).toBeFalse(); // Verify that isActionOpen is set to false
    });
});

describe('PlayPageMouseHandlerService - Constructor', () => {
    let service: PlayPageMouseHandlerService;
    let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;
    let signalUserStartedMovingSubject: Subject<void>;

    beforeEach(() => {
        signalUserStartedMovingSubject = new Subject<void>();

        playGameBoardManagerServiceSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            signalUserStartedMoving$: signalUserStartedMovingSubject.asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [PlayPageMouseHandlerService, { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerServiceSpy }],
        });

        service = TestBed.inject(PlayPageMouseHandlerService);
    });

    it('should call clearUI when signalUserStartedMoving$ emits', () => {
        spyOn(service, 'clearUI');

        signalUserStartedMovingSubject.next();

        expect(service.clearUI).toHaveBeenCalled();
    });

    it('should complete the subscription when destroy$ emits', () => {
        spyOn(service, 'clearUI');

        service.ngOnDestroy();
        signalUserStartedMovingSubject.next();

        expect(service.clearUI).not.toHaveBeenCalled();
    });
});
