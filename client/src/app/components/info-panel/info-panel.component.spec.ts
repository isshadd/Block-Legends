import { NO_ERRORS_SCHEMA } from '@angular/core'; // Import NO_ERRORS_SCHEMA to ignore unknown elements
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { Item } from '@common/classes/Items/item';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { PlayerMapEntity } from '@common/classes/Player/player-map-entity';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { InfoPanelComponent } from './info-panel.component';

describe('InfoPanelComponent', () => {
    let component: InfoPanelComponent;
    let fixture: ComponentFixture<InfoPanelComponent>;
    let mockPlayGameBoardManagerService: jasmine.SpyObj<PlayGameBoardManagerService>;
    let mockWalkableTile: WalkableTile;
    let mockTerrainTile: TerrainTile;
    let mockPlayerCharacter: PlayerCharacter;
    let mockItem: Item;

    beforeEach(async () => {
        // Create a mock for PlayGameBoardManagerService
        mockPlayGameBoardManagerService = jasmine.createSpyObj('PlayGameBoardManagerService', ['findPlayerFromPlayerMapEntity']);

        await TestBed.configureTestingModule({
            imports: [InfoPanelComponent], // Import the standalone component
            providers: [{ provide: PlayGameBoardManagerService, useValue: mockPlayGameBoardManagerService }],
            schemas: [NO_ERRORS_SCHEMA], // Ignore unknown elements and attributes
        }).compileComponents();

        fixture = TestBed.createComponent(InfoPanelComponent);
        component = fixture.componentInstance;

        // Create mock instances
        mockWalkableTile = new WalkableTile();
        mockTerrainTile = new TerrainTile();
        mockPlayerCharacter = new PlayerCharacter('test');
        mockPlayerCharacter.avatar = AvatarEnum.Alex;
        // Mock the 'fullImage' property expected by PlayerMapEntityInfoViewComponent
        (mockPlayerCharacter as PlayerCharacter).avatar.fullImage = AvatarEnum.Alex.fullImage;
        mockItem = new Item();

        // Initialize tile with a non-walkable Tile to prevent undefined access during initial change detection
        component.tile = new Tile(); // Assign a plain Tile which is not Walkable
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit close event when closePanelEvent is called', () => {
        spyOn(component.closePanelEvent, 'emit');
        component.closePanel();
        expect(component.closePanelEvent.emit).toHaveBeenCalled();
    });

    it('should return true for isWalkableTile() if tile is an instance of WalkableTile', () => {
        component.tile = mockWalkableTile;
        fixture.detectChanges(); // Trigger change detection after setting tile
        expect(component.isWalkableTile()).toBeTrue();
    });

    it('should return false for isWalkableTile() if tile is not an instance of WalkableTile', () => {
        const nonWalkableTile = new Tile(); // Create a plain Tile which does not extend WalkableTile
        component.tile = nonWalkableTile;
        fixture.detectChanges(); // Trigger change detection after setting tile
        expect(component.isWalkableTile()).toBeFalse();
    });

    it('should return true for isTerrainTile() if tile is a TerrainTile', () => {
        spyOn(mockTerrainTile, 'isTerrain').and.returnValue(true);
        component.tile = mockTerrainTile;
        fixture.detectChanges(); // Trigger change detection after setting tile
        expect(component.isTerrainTile()).toBeTrue();
    });

    it('should return null for getPlayer() if tile is not WalkableTile', () => {
        const nonWalkableTile = new Tile();
        component.tile = nonWalkableTile;
        fixture.detectChanges();
        expect(component.getPlayer()).toBeNull();
    });

    it('should return the player if tile is WalkableTile and player is present', () => {
        // Mock a PlayerMapEntity with necessary properties/methods
        mockPlayerCharacter.avatar = AvatarEnum.Alex;
        const mockPlayerMapEntity = new PlayerMapEntity(AvatarEnum.Alex.headImage);
        mockPlayerCharacter.mapEntity = mockPlayerMapEntity;
        mockWalkableTile.player = mockPlayerMapEntity;

        component.tile = mockWalkableTile;
        mockPlayGameBoardManagerService.findPlayerFromPlayerMapEntity.and.returnValue(mockPlayerCharacter);
        fixture.detectChanges(); // Trigger change detection after setting tile

        expect(component.getPlayer()).toBe(mockPlayerCharacter);
    });

    it('should return null if getPlayer() is called on WalkableTile with no player', () => {
        component.tile = mockWalkableTile;
        mockWalkableTile.player = null;
        fixture.detectChanges(); // Trigger change detection after setting tile

        expect(component.getPlayer()).toBeNull();
    });

    it('should return the item if tile is TerrainTile', () => {
        component.tile = mockTerrainTile;
        mockTerrainTile.item = mockItem;
        fixture.detectChanges(); // Trigger change detection after setting tile
        expect(component.getItem()).toBe(mockItem);
    });

    it('should return null if tile is TerrainTile with no item', () => {
        component.tile = mockTerrainTile;
        mockTerrainTile.item = null;
        fixture.detectChanges(); // Trigger change detection after setting tile
        expect(component.getItem()).toBeNull();
    });
});
