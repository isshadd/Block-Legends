import { TestBed } from '@angular/core/testing';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
// import { Subject } from 'rxjs';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { ProfileEnum } from '@common/enums/profile';
import { Vec2 } from '@common/interfaces/vec2';
import { PlayGameBoardManagerService } from './play-game-board-manager.service';
import { VirtualPlayerManagerService } from './virtual-player-manager.service';

describe('VirtualPlayerManagerService', () => {
  let service: VirtualPlayerManagerService;
  let mockPlayGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;
  let mockGameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
  let mockWebSocketService: jasmine.SpyObj<WebSocketService>;

  beforeEach(() => {
    // Create mock spy objects for dependencies
    mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', [
      'findPlayerFromSocketId', 
      'getAdjacentActionTiles', 
      'signalUserDidBattleAction',
      'signalUserDidDoorAction',
      'checkIfPLayerDidEverything',
      'signalUserStartedMoving',
      'findPlayerFromPlayerMapEntity',
      'doesPlayerHaveItem'
    ],{
      // Define signalUserDidBattleAction and signalUserDidDoorAction as Subjects with spy methods
      signalUserDidBattleAction: jasmine.createSpyObj('signalUserDidBattleAction', ['next']),
      signalUserDidDoorAction: jasmine.createSpyObj('signalUserDidDoorAction', ['next']),
    });


    mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', [
      'getPossibleMovementTiles',
      'getTileAt',
      'getNeighbours',
      'isGameModeCTF',
      'getClosestWalkableTileWithoutPlayerAt'
    ]);

  mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['getTileAt']);

    mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['getRoomInfo']);

    // Create the service with mock dependencies
    TestBed.configureTestingModule({
      providers: [
        VirtualPlayerManagerService,
        { provide: PlayGameBoardManagerService, useValue: mockPlayGameBoardManagerService },
        { provide: GameMapDataManagerService, useValue: mockGameMapDataManagerService },
        { provide: WebSocketService, useValue: mockWebSocketService }
      ]
    });

    service = TestBed.inject(VirtualPlayerManagerService);

    });

    describe('startTurn', () => {
      beforeEach(() => {
        spyOn(service, 'setPossibleMoves');
        spyOn(service, 'handleVirtualPlayerTurn');
        spyOn(service, 'handleAgressiveComportment');
        spyOn(service, 'handleDefensiveComportment');
      });
      it('should call handleVirtualPlayerTurn with the virtual player and true when player exists', () => {
        // Arrange
        const playerId = 'player-1234';
        const mockVirtualPlayer: PlayerCharacter = {
          socketId: playerId,
          mapEntity: new PlayerMapEntity('avatar.png'),
          comportement: ProfileEnum.Agressive,
          isVirtual: true,
        } as PlayerCharacter;
  
        // Mock the `findPlayerFromSocketId` method to return the mock virtual player
        mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockVirtualPlayer);
  
        // Act
        service.startTurn(playerId);
  
        // Assert
        expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith(playerId);
        expect(service.handleVirtualPlayerTurn).toHaveBeenCalledWith(mockVirtualPlayer, true);
      });
  
      it('should not call handleVirtualPlayerTurn when player does not exist', () => {
        // Arrange
        const playerId = 'non-existent-player';
        
        // Mock the `findPlayerFromSocketId` method to return null, indicating player not found
        mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(null);
  
        // Act
        service.startTurn(playerId);
  
        // Assert
        expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith(playerId);
        expect(service.handleVirtualPlayerTurn).not.toHaveBeenCalled();
      });
    });

    describe('continueTurn', () => {
      beforeEach(() => {
        spyOn(service, 'setPossibleMoves');
        spyOn(service, 'handleVirtualPlayerTurn');
        spyOn(service, 'handleAgressiveComportment');
        spyOn(service, 'handleDefensiveComportment');
      });
      it('should call handleVirtualPlayerTurn with the virtual player when player exists', () => {
        // Arrange
        const playerId = 'player-123';
        const mockVirtualPlayer: PlayerCharacter = {
          socketId: playerId,
          mapEntity: new PlayerMapEntity('avatar.png'),
          comportement: ProfileEnum.Agressive,
          isVirtual: true,
        } as PlayerCharacter;
        
        mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(mockVirtualPlayer);
  
        // Act
        service.setPossibleMoves(mockVirtualPlayer);
        mockPlayGameBoardManagerService.findPlayerFromSocketId(mockVirtualPlayer.socketId);
        service.handleVirtualPlayerTurn(mockVirtualPlayer, true);
        service.continueTurn(playerId);
  
        // Assert
        expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith(playerId);
        expect(service.setPossibleMoves).toHaveBeenCalledWith(mockVirtualPlayer);
        expect(service.handleVirtualPlayerTurn).toHaveBeenCalledWith(mockVirtualPlayer, false);
      });
  
      it('should not call handleVirtualPlayerTurn when player does not exist', () => {
        // Arrange
        const playerId = 'non-existent-player';
        mockPlayGameBoardManagerService.findPlayerFromSocketId.and.returnValue(null);
  
        // Act
        service.continueTurn(playerId);
  
        // Assert
        expect(mockPlayGameBoardManagerService.findPlayerFromSocketId).toHaveBeenCalledWith(playerId);
        expect(service.handleVirtualPlayerTurn).not.toHaveBeenCalled();
      });
    });

    describe('handleVirtualPlayerTurn', () => {
      beforeEach(() => {
        spyOn(service, 'setPossibleMoves');
        // spyOn(service, 'handleVirtualPlayerTurn');
        spyOn(service, 'handleAgressiveComportment');
        spyOn(service, 'handleDefensiveComportment');
      });
      it('should return early if the player is not virtual', () => {
        // Arrange
        const nonVirtualPlayer: PlayerCharacter = {
          socketId: 'player-1',
          mapEntity: new PlayerMapEntity('avatar.png'),
          isVirtual: false,
        } as PlayerCharacter;
  
        // Act
        service.handleVirtualPlayerTurn(nonVirtualPlayer, true);
  
        // Assert
        expect(service.handleAgressiveComportment).not.toHaveBeenCalled();
        expect(service.handleDefensiveComportment).not.toHaveBeenCalled();
      });
  
      it('should call handleAgressiveComportment for a virtual aggressive player', () => {
        // Arrange
        const virtualAggressivePlayer: PlayerCharacter = {
          socketId: 'player-2',
          mapEntity: new PlayerMapEntity('avatar.png'),
          comportement: ProfileEnum.Agressive,
          isVirtual: true,
        } as PlayerCharacter;
  
        // Act
        service.handleVirtualPlayerTurn(virtualAggressivePlayer, true);
  
        // Assert
        expect(service.handleAgressiveComportment).toHaveBeenCalledWith(virtualAggressivePlayer, true);
        expect(service.handleDefensiveComportment).not.toHaveBeenCalled();
      });
  
      it('should call handleDefensiveComportment for a virtual defensive player', () => {
        // Arrange
        const virtualDefensivePlayer: PlayerCharacter = {
          socketId: 'player-3',
          mapEntity: new PlayerMapEntity('avatar.png'),
          comportement: ProfileEnum.Defensive,
          isVirtual: true,
        } as PlayerCharacter;
  
        // Act
        service.handleVirtualPlayerTurn(virtualDefensivePlayer, false);
  
        // Assert
        expect(service.handleDefensiveComportment).toHaveBeenCalledWith(virtualDefensivePlayer, false);
        expect(service.handleAgressiveComportment).not.toHaveBeenCalled();
      });
    });
    
    describe('handleAgressiveComportment', () => {
      let player: PlayerCharacter;
      let didTurnStarted: boolean;
  
      beforeEach(() => {
        // Initialize common variables
        didTurnStarted = true;
        player = {
          socketId: 'player-1',
          mapEntity: new PlayerMapEntity('avatar.png'),
          comportement: ProfileEnum.Agressive,
          isVirtual: true,
        } as PlayerCharacter;
      });
  
      it('should call handleAggressiveActions with the player', () => {
        // Arrange
        spyOn(service, 'handleAggressiveActions').and.returnValue(true);
        spyOn(service, 'handleAggressiveMovement');
  
        // Act
        service.handleAgressiveComportment(player, didTurnStarted);
  
        // Assert
        expect(service.handleAggressiveActions).toHaveBeenCalledWith(player);
      });
  
      it('should not call handleAggressiveMovement if handleAggressiveActions returns true', () => {
        // Arrange
        spyOn(service, 'handleAggressiveActions').and.returnValue(true);
        spyOn(service, 'handleAggressiveMovement');
  
        // Act
        service.handleAgressiveComportment(player, didTurnStarted);
  
        // Assert
        expect(service.handleAggressiveActions).toHaveBeenCalledWith(player);
        expect(service.handleAggressiveMovement).not.toHaveBeenCalled();
      });
  
      it('should call handleAggressiveMovement if handleAggressiveActions returns false', () => {
        // Arrange
        const didTurnStartedFlag = false; // Change as needed
        spyOn(service, 'handleAggressiveActions').and.returnValue(false);
        spyOn(service, 'handleAggressiveMovement');
  
        // Act
        service.handleAgressiveComportment(player, didTurnStartedFlag);
  
        // Assert
        expect(service.handleAggressiveActions).toHaveBeenCalledWith(player);
        expect(service.handleAggressiveMovement).toHaveBeenCalledWith(player, didTurnStartedFlag);
      });
    });

    describe('handleAggressiveActions', () => {
      let mockPlayerCharacter: PlayerCharacter;

      beforeEach(() => {
          // Create and configure the PlayerCharacter instance
          mockPlayerCharacter = new PlayerCharacter('player1');
          mockPlayerCharacter.socketId = 'player1';
          mockPlayerCharacter.name = 'player1';
          mockPlayerCharacter.comportement = ProfileEnum.Agressive; // Assuming AvatarEnum is similar to ProfileEnum
          mockPlayerCharacter.attributes = { life: 3, speed: 3, attack: 3, defense: 3 };
          mockPlayerCharacter.mapEntity = new PlayerMapEntity('avatar.png');
          mockPlayerCharacter.mapEntity.coordinates = { x: 0, y: 0 } as Vec2;
          mockPlayerCharacter.currentActionPoints = 3;
          mockPlayerCharacter.currentMovePoints = 0;

      });

      it('should return false if player has no action points', () => {
          // Arrange
          mockPlayerCharacter.currentActionPoints = 0;

          // Act
          const result = service.handleAggressiveActions(mockPlayerCharacter);

          // Assert
          expect(result).toBeFalse();
          expect(mockGameMapDataManagerService.getTileAt).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.getAdjacentActionTiles).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.signalUserDidBattleAction.next).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.signalUserDidDoorAction.next).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.checkIfPLayerDidEverything).not.toHaveBeenCalled();

          // Verify that no emission happened
          let emitted = false;
          service.signalVirtualPlayerContinueTurn.subscribe(() => {
              emitted = true;
          });
          expect(emitted).toBeFalse();
      });

      it('should return false if there are no adjacent action tiles', () => {
          // Arrange
          mockGameMapDataManagerService.getTileAt.and.returnValue({
              coordinates: { x: 0, y: 0 },
          } as Tile);
          mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([]);

          // Act
          const result = service.handleAggressiveActions(mockPlayerCharacter);

          // Assert
          expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith({ x: 0, y: 0 });
          expect(mockPlayGameBoardManagerService.getAdjacentActionTiles).toHaveBeenCalledWith({
              coordinates: { x: 0, y: 0 },
          } as Tile);
          expect(result).toBeFalse();
          expect(mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.signalUserDidBattleAction.next).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.signalUserDidDoorAction.next).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.checkIfPLayerDidEverything).not.toHaveBeenCalled();

          // Verify that no emission happened
          let emitted = false;
          service.signalVirtualPlayerContinueTurn.subscribe(() => {
              emitted = true;
          });
          expect(emitted).toBeFalse();
      });

      it('should handle battle action and return true when enemy player is present in WalkableTile', () => {
          // Arrange
          const enemyPlayerMapEntity = new PlayerMapEntity('enemy-avatar.png');
          enemyPlayerMapEntity.coordinates = { x: 1, y: 1 } as Vec2;

          const enemyPlayer = new PlayerCharacter('enemy-1');
          enemyPlayer.socketId = 'enemy-1';
          enemyPlayer.name = 'enemy1';
          enemyPlayer.comportement = ProfileEnum.Defensive; // Assuming defensive avatar
          enemyPlayer.attributes = { life: 2, speed: 2, attack: 2, defense: 2 };
          enemyPlayer.mapEntity = enemyPlayerMapEntity;
          enemyPlayer.currentActionPoints = 2;
          enemyPlayer.currentMovePoints = 0;

          // Mock the player's current tile
          const playerTile: Tile = {
              coordinates: { x: 0, y: 0 },
          } as Tile;

          mockGameMapDataManagerService.getTileAt.and.returnValue(playerTile);

          // Create a WalkableTile with an enemy player
          const walkableTile = new GrassTile();
          walkableTile.coordinates = { x: 1, y: 1 } as Vec2;
          walkableTile.player = enemyPlayer.mapEntity;
          spyOn(walkableTile, 'hasPlayer').and.returnValue(true);

          // Mock adjacent action tiles to include the walkable tile
          mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([walkableTile]);

          // Mock finding the enemy player from PlayerMapEntity
          mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity.and.returnValue(enemyPlayer);

          // Act
          const result = service.handleAggressiveActions(mockPlayerCharacter);

          // Assert
          expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith({ x: 0, y: 0 });
          expect(mockPlayGameBoardManagerService.getAdjacentActionTiles).toHaveBeenCalledWith(playerTile);
          expect(mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity).toHaveBeenCalledWith(enemyPlayer.mapEntity);
          expect(mockPlayGameBoardManagerService.signalUserDidBattleAction.next).toHaveBeenCalledWith({
              playerTurnId: 'player1',
              enemyPlayerId: 'enemy-1',
          });
          expect(result).toBeTrue();
          expect(mockPlayGameBoardManagerService.signalUserDidDoorAction.next).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.checkIfPLayerDidEverything).not.toHaveBeenCalled();

          // Verify that no emission happened
          let emitted = false;
          service.signalVirtualPlayerContinueTurn.subscribe(() => {
              emitted = true;
          });
          expect(emitted).toBeFalse();
      });

      it('should handle door action and return true when DoorTile is present', (done) => {
          // Arrange
          const playerTile: Tile = {
              coordinates: { x: 0, y: 0 },
          } as Tile;

          mockGameMapDataManagerService.getTileAt.and.returnValue(playerTile);

          // Create a DoorTile
          const doorTile = new DoorTile();
          doorTile.coordinates = { x: 2, y: 2 } as Vec2;

          // Mock adjacent action tiles to include the door tile
          mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([doorTile]);

          // Spy on the turn continuation Subject
          service.signalVirtualPlayerContinueTurn.subscribe((socketId) => {
              expect(socketId).toBe('player1');
              done();
          });

          // Act
          const result = service.handleAggressiveActions(mockPlayerCharacter);

          // Assert
          expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith({ x: 0, y: 0 });
          expect(mockPlayGameBoardManagerService.getAdjacentActionTiles).toHaveBeenCalledWith(playerTile);
          expect(mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.signalUserDidBattleAction.next).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.signalUserDidDoorAction.next).toHaveBeenCalledWith({
              tileCoordinate: { x: 2, y: 2 },
              playerTurnId: 'player1',
          });
          expect(mockPlayGameBoardManagerService.checkIfPLayerDidEverything).toHaveBeenCalledWith(mockPlayerCharacter);
          expect(result).toBeTrue();
      });

      it('should prioritize battle action over door action and return true after handling battle', () => {
          // Arrange
          const enemyPlayerMapEntity = new PlayerMapEntity('enemy-avatar.png');
          enemyPlayerMapEntity.coordinates = { x: 1, y: 1 } as Vec2;

          const enemyPlayer = new PlayerCharacter('enemy-1');
          enemyPlayer.socketId = 'enemy-1';
          enemyPlayer.name = 'enemy1';
          enemyPlayer.comportement = ProfileEnum.Defensive; // Assuming defensive avatar
          enemyPlayer.attributes = { life: 2, speed: 2, attack: 2, defense: 2 };
          enemyPlayer.mapEntity = enemyPlayerMapEntity;
          enemyPlayer.currentActionPoints = 2;
          enemyPlayer.currentMovePoints = 0;

          // Mock the player's current tile
          const playerTile: Tile = {
              coordinates: { x: 0, y: 0 },
          } as Tile;

          mockGameMapDataManagerService.getTileAt.and.returnValue(playerTile);

          // Create a WalkableTile with an enemy player
          const walkableTile = new GrassTile();
          walkableTile.coordinates = { x: 1, y: 1 } as Vec2;
          
          walkableTile.player = enemyPlayer.mapEntity;
          spyOn(walkableTile, 'hasPlayer').and.returnValue(true);

          // Create a DoorTile
          const doorTile = new DoorTile();
          doorTile.coordinates = { x: 2, y: 2 } as Vec2;

          // Mock adjacent action tiles to include both walkable and door tiles
          mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([walkableTile, doorTile]);

          // Mock finding the enemy player from PlayerMapEntity
          mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity.and.returnValue(enemyPlayer);

          // Act
          const result = service.handleAggressiveActions(mockPlayerCharacter);

          // Assert
          expect(mockGameMapDataManagerService.getTileAt).toHaveBeenCalledWith({ x: 0, y: 0 });
          expect(mockPlayGameBoardManagerService.getAdjacentActionTiles).toHaveBeenCalledWith(playerTile);
          expect(mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity).toHaveBeenCalledWith(enemyPlayer.mapEntity);
          expect(mockPlayGameBoardManagerService.signalUserDidBattleAction.next).toHaveBeenCalledWith({
              playerTurnId: 'player1',
              enemyPlayerId: 'enemy-1',
          });
          expect(mockPlayGameBoardManagerService.signalUserDidDoorAction.next).not.toHaveBeenCalled();
          expect(mockPlayGameBoardManagerService.checkIfPLayerDidEverything).not.toHaveBeenCalled();
          expect(result).toBeTrue();
      });
    });
    describe('handleAggressiveActions', () => {
      let mockPlayerCharacter: PlayerCharacter;
      // let playerMapEntity: PlayerMapEntity;
      let mockTile: Tile;
      // let mockActionTiles: Tile[];
    
      beforeEach(() => {
        // Create a mock player
        mockPlayerCharacter = new PlayerCharacter('player1');
        mockPlayerCharacter.socketId = 'player1';
        mockPlayerCharacter.name = 'player1';
        mockPlayerCharacter.comportement = ProfileEnum.Agressive; // Assuming AvatarEnum is similar to ProfileEnum
        mockPlayerCharacter.mapEntity = new PlayerMapEntity('avatar.png');
        mockPlayerCharacter.mapEntity.coordinates = { x: 0, y: 0 } as Vec2;
        mockPlayerCharacter.currentActionPoints = 3;
        mockPlayerCharacter.currentMovePoints = 0;

        // Setup mock tile for the player
        mockTile = new GrassTile();
        mockTile.coordinates = { x: 0, y: 0 } as Vec2;
    
        // Reset mock service behaviors before each test
        mockGameMapDataManagerService.getTileAt.and.returnValue(mockTile);
      });
    
      it('should return false if player has no action points', () => {
        mockPlayerCharacter.currentActionPoints = 0;
        
        const result = service.handleAggressiveActions(mockPlayerCharacter);
        
        expect(result).toBeFalse();
      });
    
      it('should return false if no adjacent action tiles exist', () => {
        mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([]);
        
        const result = service.handleAggressiveActions(mockPlayerCharacter);
        
        expect(result).toBeFalse();
      });
    
      // it('should trigger battle action when adjacent tile has an enemy player', () => {
      //   // Create a mock walkable tile with an enemy player
      //   const enemyPlayerMapEntity = new PlayerMapEntity('enemy-avatar.png');
      //   enemyPlayerMapEntity.coordinates = { x: 1, y: 1 } as Vec2;

      //   const enemyPlayer = new PlayerCharacter('enemy-1');
      //   enemyPlayer.socketId = 'enemy-1';
      //   enemyPlayer.comportement = ProfileEnum.Defensive; // Assuming defensive avatar
      //   enemyPlayer.attributes = { life: 2, speed: 2, attack: 2, defense: 2 };
      //   enemyPlayer.mapEntity = enemyPlayerMapEntity;
      //   enemyPlayer.currentActionPoints = 2;
      //   enemyPlayer.currentMovePoints = 0;
        
      //   const enemyTile = new GrassTile();
      //   enemyTile.player = enemyPlayerMapEntity;
    
      //   mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([enemyTile]);
      //   mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity.and.returnValue(enemyPlayer);
    
      //   const result = service.handleAggressiveActions(player);
    
      //   expect(result).toBeTrue();
      //   expect(mockPlayGameBoardManagerService.signalUserDidBattleAction.next).toHaveBeenCalledWith({
      //     playerTurnId: player.socketId,
      //     enemyPlayerId: enemyPlayer.socketId
      //   });
      // });
    
      // it('should trigger door action when adjacent tile is a door', () => {
      //   const doorTile = new DoorTile({x: 1, y: 0});
        
      //   mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([doorTile]);
    
      //   const result = service.handleAggressiveActions(player);
    
      //   expect(result).toBeTrue();
      //   expect(mockPlayGameBoardManagerService.signalUserDidDoorAction.next).toHaveBeenCalledWith({
      //     tileCoordinate: doorTile.coordinates,
      //     playerTurnId: player.socketId
      //   });
      //   expect(mockPlayGameBoardManagerService.checkIfPLayerDidEverything).toHaveBeenCalledWith(player);
      // });
    
      // it('should continue virtual player turn after door action', () => {
      //   const doorTile = new DoorTile({x: 1, y: 0});
        
      //   mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([doorTile]);
    
      //   const result = service.handleAggressiveActions(player);
    
      //   expect(result).toBeTrue();
      //   expect(service.signalVirtualPlayerContinueTurn.next).toHaveBeenCalledWith(player.socketId);
      // });
    
      // it('should return false if no battle or door actions are possible', () => {
      //   const grassTile = new GrassTile({x: 1, y: 0});
        
      //   mockPlayGameBoardManagerService.getAdjacentActionTiles.and.returnValue([grassTile]);
    
      //   const result = service.handleAggressiveActions(player);
    
      //   expect(result).toBeFalse();
      // });
    });
    
});