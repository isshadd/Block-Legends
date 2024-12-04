import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteConfirmationComponent } from '@app/components/administration-page-component/delete-conformation/delete-conformation.component';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.service';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { TileFactoryService } from '@app/services/game-board-services/tile-factory/tile-factory.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { TileType } from '@common/enums/tile-type';
import { GameShared } from '@common/interfaces/game-shared';
import { Subject } from 'rxjs';
import { ListGameComponent } from './list-game.component';

describe('ListGameComponent', () => {
    let component: ListGameComponent;
    let fixture: ComponentFixture<ListGameComponent>;
    let mockAdministrationService: jasmine.SpyObj<AdministrationPageManagerService>;
    let mockGameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let mockTileFactoryService: jasmine.SpyObj<TileFactoryService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockDialog: jasmine.SpyObj<MatDialog>;

    const mockGames: GameShared[] = [
        {
            _id: '1',
            name: 'Game One',
            description: 'First game',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            imageUrl: 'url1',
            isVisible: true,
            tiles: [
                [{ type: TileType.Grass }, { type: TileType.Water }],
                [{ type: TileType.Wall }, { type: TileType.Door }],
            ],
        },
        {
            _id: '2',
            name: 'Game Two',
            description: 'Second game',
            size: MapSize.MEDIUM,
            mode: GameMode.CTF,
            imageUrl: 'url2',
            isVisible: false,
            tiles: [
                [{ type: TileType.Grass }, { type: TileType.Water }],
                [{ type: TileType.Wall }, { type: TileType.Door }],
            ],
        },
    ];

    beforeEach(async () => {
        mockAdministrationService = jasmine.createSpyObj('AdministrationPageManagerService', ['setGames', 'deleteGame', 'toggleVisibility'], {
            signalGamesSetted$: new Subject<GameShared[]>(),
        });

        mockGameMapDataManagerService = jasmine.createSpyObj('GameMapDataManagerService', ['setLocalStorageVariables']);

        mockTileFactoryService = jasmine.createSpyObj('TileFactoryService', ['loadGridFromJSON']);

        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            imports: [CommonModule, ListGameComponent],
            providers: [
                { provide: AdministrationPageManagerService, useValue: mockAdministrationService },
                { provide: GameMapDataManagerService, useValue: mockGameMapDataManagerService },
                { provide: TileFactoryService, useValue: mockTileFactoryService },
                { provide: Router, useValue: mockRouter },
                { provide: MatDialog, useValue: mockDialog },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ListGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get games and load tiles', () => {
        component.getGames(mockGames);
        expect(component.databaseGames).toEqual(mockGames);
        expect(mockTileFactoryService.loadGridFromJSON).toHaveBeenCalledTimes(mockGames.length);
    });

    it('should delete game and open delete confirmation', () => {
        component.deleteGame('1');
        expect(mockAdministrationService.deleteGame).toHaveBeenCalledWith('1');
        expect(mockDialog.open).toHaveBeenCalledWith(DeleteConfirmationComponent, {
            width: '300px',
        });
    });

    it('should toggle game visibility', () => {
        const game = mockGames[0];
        component.toggleVisibility(game);
        expect(mockAdministrationService.toggleVisibility).toHaveBeenCalledWith(game);
    });

    it('should edit game and navigate to map editor', () => {
        const game = mockGames[0];
        component.editGame(game);
        expect(mockGameMapDataManagerService.setLocalStorageVariables).toHaveBeenCalledWith(false, game);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/map-editor']);
    });

    it('should download game as JSON', () => {
        const game = mockGames[0];
        spyOn(document, 'createElement').and.callThrough();
        spyOn(document.body, 'appendChild').and.callThrough();
        spyOn(document.body, 'removeChild').and.callThrough();
        spyOn(URL, 'createObjectURL').and.callThrough();
        spyOn(URL, 'revokeObjectURL').and.callThrough();

        component.downloadGameAsJson(game);

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(document.body.appendChild).toHaveBeenCalled();
        expect(document.body.removeChild).toHaveBeenCalled();
        expect(URL.createObjectURL).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should return early if id is null or undefined in deleteGame', () => {
        // Test with null
        component.deleteGame(null);
        expect(mockAdministrationService.deleteGame).not.toHaveBeenCalled();
        expect(mockDialog.open).not.toHaveBeenCalled();

        // Test with undefined
        component.deleteGame(undefined);
        expect(mockAdministrationService.deleteGame).not.toHaveBeenCalled();
        expect(mockDialog.open).not.toHaveBeenCalled();
    });
});
