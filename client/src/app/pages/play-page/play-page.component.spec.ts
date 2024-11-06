import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { PlayPageComponent } from './play-page.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayPageMouseHandlerService } from '@app/services/play-page-services/play-page-mouse-handler.service';
import { PlayGameBoardSocketService } from '@app/services/play-page-services/game-board/play-game-board-socket.service';
import { Router } from '@angular/router';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { GameService } from '@app/services/game-services/game.service';
import { SocketStateService } from '@app/services/SocketService/socket-state.service';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Tile } from '@app/classes/Tiles/tile';
import { VisibleState } from '@app/interfaces/placeable-entity';


describe('PlayPageComponent', () => {
    let component: PlayPageComponent;
    let fixture: ComponentFixture<PlayPageComponent>;
    let playGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;
    let playPageMouseHandlerService: jasmine.SpyObj<PlayPageMouseHandlerService>;
    let playGameBoardSocketService: jasmine.SpyObj<PlayGameBoardSocketService>;
    let router: jasmine.SpyObj<Router>;
    let webSocketService: jasmine.SpyObj<WebSocketService>;
    let gameService: jasmine.SpyObj<GameService>;
    let socketStateService: jasmine.SpyObj<SocketStateService>;
    let consoleLogSpy: jasmine.Spy;

    const mockSignalManagerFinishedInit$ = new Subject<void>();
    const mockCurrentPlayer$ = new Subject<PlayerCharacter>();

    const mockPlayer1: PlayerCharacter = {
        socketId: 'player1',
        name: 'Player 1',
        attributes: {
            life: 100
        }
    } as PlayerCharacter;

    const mockPlayer2: PlayerCharacter = {
        socketId: 'player2',
        name: 'Player 2',
        attributes: {
            life: 100
        }
    } as PlayerCharacter;

    const mockTile: Tile = {
        id: 1,
        position: { x: 0, y: 0 },
        type: 'Grass', // Provide a valid TileType
        description: 'Mock Tile',
        imageUrl: 'mock-url',
        coordinates: { x: 0, y: 0 },
        visibleState: VisibleState.NotSelected,
        isItem: () => false,
        isTerrain: () => true,
        isWalkable: () => true,
        isDoor: () => false
      } as Tile;

    beforeEach(async () => {
        // Create spy for console.log
        consoleLogSpy = spyOn(console, 'log');

        playGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', 
            ['findPlayerFromSocketId'], {
                signalManagerFinishedInit$: mockSignalManagerFinishedInit$,
                userCurrentActionPoints: 3,
                isBattleOn: false,
                currentPlayerIdTurn: 'player1',
                turnOrder: ['player1', 'player2']
            }
        );

        playPageMouseHandlerService = jasmine.createSpyObj('PlayPageMouseHandlerService', 
            ['onMapTileMouseDown', 'onMapTileMouseEnter', 'onMapTileMouseLeave', 
             'discardRightClickSelecterPlayer', 'discardRightSelectedTile', 'toggleAction']
        );

        playGameBoardSocketService = jasmine.createSpyObj('PlayGameBoardSocketService', 
            ['init', 'endTurn', 'leaveGame']
        );

        router = jasmine.createSpyObj('Router', ['navigate']);
        webSocketService = jasmine.createSpyObj('WebSocketService', ['getTotalPlayers']);
        gameService = jasmine.createSpyObj('GameService', [], {
            currentPlayer$: mockCurrentPlayer$
        });
        socketStateService = jasmine.createSpyObj('SocketStateService', ['setActiveSocket']);

        await TestBed.configureTestingModule({
            imports: [PlayPageComponent],
            providers: [
                { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerService },
                { provide: PlayPageMouseHandlerService, useValue: playPageMouseHandlerService },
                { provide: PlayGameBoardSocketService, useValue: playGameBoardSocketService },
                { provide: Router, useValue: router },
                { provide: WebSocketService, useValue: webSocketService },
                { provide: GameService, useValue: gameService },
                { provide: SocketStateService, useValue: socketStateService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PlayPageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(playGameBoardSocketService.init).toHaveBeenCalled();
    });

    describe('Constructor Initialization', () => {
        it('should initialize with default values', () => {
            expect(component.selectedTile).toBeNull();
            expect(component.isBattlePhase).toBeFalse();
            expect(component.players).toEqual([]);
            expect(component['destroy$']).toBeTruthy();
        });

        it('should subscribe to signalManagerFinishedInit$', () => {
            const initSpy = spyOn(component, 'onPlayGameBoardManagerInit');
            mockSignalManagerFinishedInit$.next();
            expect(initSpy).toHaveBeenCalled();
        });
    });

    describe('onPlayGameBoardManagerInit', () => {
        beforeEach(() => {
            // Reset the players array before each test
            component.players = [];
            // Setup spy for getPlayersTurn
            spyOn(component, 'getPlayersTurn').and.callThrough();
        });

        it('should initialize game state variables correctly', () => {
            playGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockPlayer1);
            
            component.onPlayGameBoardManagerInit();

            expect(component.actionPoints).toBe(playGameBoardManagerService.userCurrentActionPoints);
            expect(component.isBattlePhase).toBe(playGameBoardManagerService.isBattleOn);
            expect(component.currentPlayer).toEqual(mockPlayer1);
            expect(component.getPlayersTurn).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith('Joueurs:', component.players);
        });

        it('should handle case when current player is not found', () => {
            playGameBoardManagerService.findPlayerFromSocketId.and.returnValue(null);
            
            component.onPlayGameBoardManagerInit();

            expect(component.currentPlayer).toBeNull();
            expect(component.getPlayersTurn).toHaveBeenCalled();
            expect(consoleLogSpy).toHaveBeenCalledWith('Joueurs:', []);
        });
    });

    describe('getPlayersTurn', () => {
        beforeEach(() => {
            // Reset the players array before each test
            component.players = [];
        });

        it('should populate players array with found players', () => {
            playGameBoardManagerService.findPlayerFromSocketId.and.returnValues(mockPlayer1, mockPlayer2);
            
            component.getPlayersTurn();

            expect(component.players.length).toBe(2);
            expect(component.players).toContain(mockPlayer1);
            expect(component.players).toContain(mockPlayer2);
            expect(consoleLogSpy).toHaveBeenCalledWith('Nom du joueur:', 'player1');
            expect(consoleLogSpy).toHaveBeenCalledWith('Nom du joueur:', 'player2');
        });

        it('should handle null players in turn order', () => {
            playGameBoardManagerService.findPlayerFromSocketId.and.returnValues(mockPlayer1, null);
            
            component.getPlayersTurn();

            expect(component.players.length).toBe(1);
            expect(component.players).toContain(mockPlayer1);
            expect(consoleLogSpy).toHaveBeenCalledWith('Nom du joueur:', 'player1');
            expect(consoleLogSpy).toHaveBeenCalledWith('Nom du joueur:', 'player2');
        });

        it('should handle empty turn order', () => {
            Object.defineProperty(playGameBoardManagerService, 'turnOrder', {
                get: () => []
            });
            
            component.getPlayersTurn();

            expect(component.players.length).toBe(0);
        });

        it('should handle undefined playerName in turn order', () => {
            Object.defineProperty(playGameBoardManagerService, 'turnOrder', {
                get: () => [undefined, 'player1']
            });
            playGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockPlayer1);
            
            component.getPlayersTurn();

            expect(component.players.length).toBe(1);
            expect(component.players).toContain(mockPlayer1);
        });
    });

    describe('ngOnInit', () => {
        it('should initialize component and subscribe to current player', fakeAsync(() => {
            component.ngOnInit();
            mockCurrentPlayer$.next(mockPlayer1);
            tick();

            expect(socketStateService.setActiveSocket).toHaveBeenCalledWith(webSocketService);
            expect(component.myPlayer).toEqual(mockPlayer1);
            expect(component.totalLifePoints).toBe(mockPlayer1.attributes.life);
            expect(consoleLogSpy).toHaveBeenCalledWith('Joueur actuel:', mockPlayer1);
        }));

        it('should handle player without life attributes', fakeAsync(() => {
            const playerWithoutLife = { ...mockPlayer1, attributes: {} } as PlayerCharacter;
            component.ngOnInit();
            mockCurrentPlayer$.next(playerWithoutLife);
            tick();

            expect(component.myPlayer).toEqual(playerWithoutLife);
            expect(component.totalLifePoints).toBeUndefined();
        }));
    });

    describe('Mouse Event Handlers', () => {
        it('should handle onMapTileMouseDown', () => {
            const mouseEvent = new MouseEvent('mousedown');
            component.onMapTileMouseDown(mouseEvent, mockTile);

            expect(playPageMouseHandlerService.onMapTileMouseDown)
                .toHaveBeenCalledWith(mouseEvent, mockTile);
        });

        it('should handle onMapTileMouseEnter', () => {
            component.onMapTileMouseEnter(mockTile);
            expect(playPageMouseHandlerService.onMapTileMouseEnter)
                .toHaveBeenCalledWith(mockTile);
        });

        it('should handle onMapTileMouseLeave', () => {
            component.onMapTileMouseLeave(mockTile);
            expect(playPageMouseHandlerService.onMapTileMouseLeave)
                .toHaveBeenCalledWith(mockTile);
        });
    });

    describe('Panel and Action Controls', () => {
        it('should close player info panel', () => {
            component.closePlayerInfoPanel();
            expect(playPageMouseHandlerService.discardRightClickSelecterPlayer)
                .toHaveBeenCalled();
        });

        it('should close tile info panel', () => {
            component.closeTileInfoPanel();
            expect(playPageMouseHandlerService.discardRightSelectedTile)
                .toHaveBeenCalled();
        });

        it('should toggle action', () => {
            component.toggleAction();
            expect(playPageMouseHandlerService.toggleAction)
                .toHaveBeenCalled();
        });
    });

    describe('Game Control Actions', () => {
        it('should handle end turn', () => {
            component.endTurn();
            expect(playGameBoardSocketService.endTurn)
                .toHaveBeenCalled();
        });

        it('should handle leave game', () => {
            component.leaveGame();
            
            expect(playGameBoardSocketService.leaveGame).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith(['/home']);
        });
    });


    describe('Cleanup', () => {
        it('should properly cleanup on destroy', () => {
            const nextSpy = spyOn(component['destroy$'], 'next');
            const completeSpy = spyOn(component['destroy$'], 'complete');

            component.ngOnDestroy();

            expect(nextSpy).toHaveBeenCalled();
            expect(completeSpy).toHaveBeenCalled();
        });

        describe('PlayPageComponent', () => {
            let component: PlayPageComponent;
            let fixture: ComponentFixture<PlayPageComponent>;
            let playGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;
            let playPageMouseHandlerService: jasmine.SpyObj<PlayPageMouseHandlerService>;
            let playGameBoardSocketService: jasmine.SpyObj<PlayGameBoardSocketService>;
            let router: jasmine.SpyObj<Router>;
            let webSocketService: jasmine.SpyObj<WebSocketService>;
            let gameService: jasmine.SpyObj<GameService>;
            let socketStateService: jasmine.SpyObj<SocketStateService>;
            let consoleLogSpy: jasmine.Spy;

            const mockSignalManagerFinishedInit$ = new Subject<void>();
            const mockCurrentPlayer$ = new Subject<PlayerCharacter>();

            const mockPlayer1: PlayerCharacter = {
                socketId: 'player1',
                name: 'Player 1',
                attributes: {
                    life: 100
                }
            } as PlayerCharacter;

            const mockPlayer2: PlayerCharacter = {
                socketId: 'player2',
                name: 'Player 2',
                attributes: {
                    life: 100
                }
            } as PlayerCharacter;

            const mockTile: Tile = {
                id: 1,
                position: { x: 0, y: 0 },
                type: 'Grass', // Provide a valid TileType
                description: 'Mock Tile',
                imageUrl: 'mock-url',
                coordinates: { x: 0, y: 0 },
                visibleState: VisibleState.NotSelected,
                isItem: () => false,
                isTerrain: () => true,
                isWalkable: () => true,
                isDoor: () => false
            } as Tile;

            beforeEach(async () => {
                // Create spy for console.log
                consoleLogSpy = spyOn(console, 'log');

                playGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService',
                    ['findPlayerFromSocketId'], {
                        signalManagerFinishedInit$: mockSignalManagerFinishedInit$,
                        userCurrentActionPoints: 3,
                        isBattleOn: false,
                        currentPlayerIdTurn: 'player1',
                        turnOrder: ['player1', 'player2']
                    }
                );

                playPageMouseHandlerService = jasmine.createSpyObj('PlayPageMouseHandlerService',
                    ['onMapTileMouseDown', 'onMapTileMouseEnter', 'onMapTileMouseLeave',
                        'discardRightClickSelecterPlayer', 'discardRightSelectedTile', 'toggleAction']
                );

                playGameBoardSocketService = jasmine.createSpyObj('PlayGameBoardSocketService',
                    ['init', 'endTurn', 'leaveGame']
                );

                router = jasmine.createSpyObj('Router', ['navigate']);
                webSocketService = jasmine.createSpyObj('WebSocketService', ['getTotalPlayers']);
                gameService = jasmine.createSpyObj('GameService', [], {
                    currentPlayer$: mockCurrentPlayer$
                });
                socketStateService = jasmine.createSpyObj('SocketStateService', ['setActiveSocket']);

                await TestBed.configureTestingModule({
                    imports: [PlayPageComponent],
                    providers: [
                        { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerService },
                        { provide: PlayPageMouseHandlerService, useValue: playPageMouseHandlerService },
                        { provide: PlayGameBoardSocketService, useValue: playGameBoardSocketService },
                        { provide: Router, useValue: router },
                        { provide: WebSocketService, useValue: webSocketService },
                        { provide: GameService, useValue: gameService },
                        { provide: SocketStateService, useValue: socketStateService }
                    ]
                }).compileComponents();

                fixture = TestBed.createComponent(PlayPageComponent);
                component = fixture.componentInstance;
            });

            it('should create', () => {
                expect(component).toBeTruthy();
                expect(playGameBoardSocketService.init).toHaveBeenCalled();
            });

            describe('Constructor Initialization', () => {
                it('should initialize with default values', () => {
                    expect(component.selectedTile).toBeNull();
                    expect(component.isBattlePhase).toBeFalse();
                    expect(component.players).toEqual([]);
                    expect(component['destroy$']).toBeTruthy();
                });

                it('should subscribe to signalManagerFinishedInit$', () => {
                    const initSpy = spyOn(component, 'onPlayGameBoardManagerInit');
                    mockSignalManagerFinishedInit$.next();
                    expect(initSpy).toHaveBeenCalled();
                });
            });

            describe('onPlayGameBoardManagerInit', () => {
                beforeEach(() => {
                    // Reset the players array before each test
                    component.players = [];
                    // Setup spy for getPlayersTurn
                    spyOn(component, 'getPlayersTurn').and.callThrough();
                });

                it('should initialize game state variables correctly', () => {
                    playGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockPlayer1);

                    component.onPlayGameBoardManagerInit();

                    expect(component.actionPoints).toBe(playGameBoardManagerService.userCurrentActionPoints);
                    expect(component.isBattlePhase).toBe(playGameBoardManagerService.isBattleOn);
                    expect(component.currentPlayer).toEqual(mockPlayer1);
                    expect(component.getPlayersTurn).toHaveBeenCalled();
                    expect(consoleLogSpy).toHaveBeenCalledWith('Joueurs:', component.players);
                });

                it('should handle case when current player is not found', () => {
                    playGameBoardManagerService.findPlayerFromSocketId.and.returnValue(null);

                    component.onPlayGameBoardManagerInit();

                    expect(component.currentPlayer).toBeNull();
                    expect(component.getPlayersTurn).toHaveBeenCalled();
                    expect(consoleLogSpy).toHaveBeenCalledWith('Joueurs:', []);
                });
            });

            describe('getPlayersTurn', () => {
                beforeEach(() => {
                    // Reset the players array before each test
                    component.players = [];
                });

                it('should populate players array with found players', () => {
                    playGameBoardManagerService.findPlayerFromSocketId.and.returnValues(mockPlayer1, mockPlayer2);

                    component.getPlayersTurn();

                    expect(component.players.length).toBe(2);
                    expect(component.players).toContain(mockPlayer1);
                    expect(component.players).toContain(mockPlayer2);
                    expect(consoleLogSpy).toHaveBeenCalledWith('Nom du joueur:', 'player1');
                    expect(consoleLogSpy).toHaveBeenCalledWith('Nom du joueur:', 'player2');
                });

                it('should handle null players in turn order', () => {
                    playGameBoardManagerService.findPlayerFromSocketId.and.returnValues(mockPlayer1, null);

                    component.getPlayersTurn();

                    expect(component.players.length).toBe(1);
                    expect(component.players).toContain(mockPlayer1);
                    expect(consoleLogSpy).toHaveBeenCalledWith('Nom du joueur:', 'player1');
                    expect(consoleLogSpy).toHaveBeenCalledWith('Nom du joueur:', 'player2');
                });

                it('should handle empty turn order', () => {
                    Object.defineProperty(playGameBoardManagerService, 'turnOrder', {
                        get: () => []
                    });

                    component.getPlayersTurn();

                    expect(component.players.length).toBe(0);
                });

                it('should handle undefined playerName in turn order', () => {
                    Object.defineProperty(playGameBoardManagerService, 'turnOrder', {
                        get: () => [undefined, 'player1']
                    });
                    playGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockPlayer1);

                    component.getPlayersTurn();

                    expect(component.players.length).toBe(1);
                    expect(component.players).toContain(mockPlayer1);
                });
            });

            describe('ngOnInit', () => {
                it('should initialize component and subscribe to current player', fakeAsync(() => {
                    component.ngOnInit();
                    mockCurrentPlayer$.next(mockPlayer1);
                    tick();

                    expect(socketStateService.setActiveSocket).toHaveBeenCalledWith(webSocketService);
                    expect(component.myPlayer).toEqual(mockPlayer1);
                    expect(component.totalLifePoints).toBe(mockPlayer1.attributes.life);
                    expect(consoleLogSpy).toHaveBeenCalledWith('Joueur actuel:', mockPlayer1);
                }));

                it('should handle player without life attributes', fakeAsync(() => {
                    const playerWithoutLife = { ...mockPlayer1, attributes: {} } as PlayerCharacter;
                    component.ngOnInit();
                    mockCurrentPlayer$.next(playerWithoutLife);
                    tick();

                    expect(component.myPlayer).toEqual(playerWithoutLife);
                    expect(component.totalLifePoints).toBeUndefined();
                }));
            });

            describe('Mouse Event Handlers', () => {
                it('should handle onMapTileMouseDown', () => {
                    const mouseEvent = new MouseEvent('mousedown');
                    component.onMapTileMouseDown(mouseEvent, mockTile);

                    expect(playPageMouseHandlerService.onMapTileMouseDown)
                        .toHaveBeenCalledWith(mouseEvent, mockTile);
                });

                it('should handle onMapTileMouseEnter', () => {
                    component.onMapTileMouseEnter(mockTile);
                    expect(playPageMouseHandlerService.onMapTileMouseEnter)
                        .toHaveBeenCalledWith(mockTile);
                });

                it('should handle onMapTileMouseLeave', () => {
                    component.onMapTileMouseLeave(mockTile);
                    expect(playPageMouseHandlerService.onMapTileMouseLeave)
                        .toHaveBeenCalledWith(mockTile);
                });
            });

            describe('Panel and Action Controls', () => {
                it('should close player info panel', () => {
                    component.closePlayerInfoPanel();
                    expect(playPageMouseHandlerService.discardRightClickSelecterPlayer)
                        .toHaveBeenCalled();
                });

                it('should close tile info panel', () => {
                    component.closeTileInfoPanel();
                    expect(playPageMouseHandlerService.discardRightSelectedTile)
                        .toHaveBeenCalled();
                });

                it('should toggle action', () => {
                    component.toggleAction();
                    expect(playPageMouseHandlerService.toggleAction)
                        .toHaveBeenCalled();
                });
            });

            describe('Game Control Actions', () => {
                it('should handle end turn', () => {
                    component.endTurn();
                    expect(playGameBoardSocketService.endTurn)
                        .toHaveBeenCalled();
                });

                it('should handle leave game', () => {
                    component.leaveGame();

                    expect(playGameBoardSocketService.leaveGame).toHaveBeenCalled();
                    expect(router.navigate).toHaveBeenCalledWith(['/home']);
                });
            });

            describe('Cleanup', () => {
                it('should properly cleanup on destroy', () => {
                    const nextSpy = spyOn(component['destroy$'], 'next');
                    const completeSpy = spyOn(component['destroy$'], 'complete');

                    component.ngOnDestroy();

                    expect(nextSpy).toHaveBeenCalled();
                    expect(completeSpy).toHaveBeenCalled();
                });
            });
        });
    });
});