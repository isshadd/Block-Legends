import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { ButtonNotificationState } from '../button-notification/button-notification.component';
import { MapEditorModalComponent } from '../map-editor-modal/map-editor-modal.component';
import { MapEditorOptionsMenuComponent } from './map-editor-options-menu.component';

describe('MapEditorOptionsMenuComponent', () => {
    let component: MapEditorOptionsMenuComponent;
    let fixture: ComponentFixture<MapEditorOptionsMenuComponent>;
    let gameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;
    let mapEditorManagerService: jasmine.SpyObj<MapEditorManagerService>;
    let matDialog: jasmine.SpyObj<MatDialog>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<MapEditorModalComponent>>;
    let mockGame: GameShared;

    beforeEach(async () => {
        const gameMapDataSpy = jasmine.createSpyObj('GameMapDataManagerService', [
            'resetGame',
            'itemCheckup',
            'save',
            'hasValidNameAndDescription',
            'isSavedGame',
        ]);
        const mapEditorSpy = jasmine.createSpyObj('MapEditorManagerService', ['itemCheckup']);
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        const dialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

        await TestBed.configureTestingModule({
            imports: [MapEditorOptionsMenuComponent],
            providers: [
                { provide: GameMapDataManagerService, useValue: gameMapDataSpy },
                { provide: MapEditorManagerService, useValue: mapEditorSpy },
                { provide: MatDialog, useValue: dialogSpy },
            ],
        }).compileComponents();

        gameMapDataManagerService = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        mapEditorManagerService = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;
        matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

        mockGame = {
            _id: 'gameId',
            name: 'Test Game',
            description: 'Test Description',
            size: MapSize.SMALL,
            mode: GameMode.Classique,
            isVisible: true,
            imageUrl: '',
            tiles: [],
        };

        fixture = TestBed.createComponent(MapEditorOptionsMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        dialogRefSpy = dialogRefSpyObj;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should open dialog and update game when onOptionsClick is called', () => {
        matDialog.open.and.returnValue(dialogRefSpy);
        dialogRefSpy.afterClosed.and.returnValue(of(mockGame));

        component.onOptionsClick();

        expect(matDialog.open).toHaveBeenCalled();
        expect(gameMapDataManagerService.currentName).toBe(mockGame.name);
        expect(gameMapDataManagerService.currentDescription).toBe(mockGame.description);
        expect(gameMapDataManagerService.isGameUpdated).toBeTrue();
    });

    it('should reset game when onResetClick is called', () => {
        component.onResetClick();
        expect(gameMapDataManagerService.resetGame).toHaveBeenCalled();
        expect(mapEditorManagerService.itemCheckup).toHaveBeenCalled();
    });

    it('should call save on GameMapDataManagerService when onSaveClick is called with valid name and description', () => {
        gameMapDataManagerService.hasValidNameAndDescription.and.returnValue(true);

        component.onSaveClick();
        expect(gameMapDataManagerService.save).toHaveBeenCalled();
    });

    it('should open options dialog if name and description are invalid when onSaveClick is called', () => {
        gameMapDataManagerService.hasValidNameAndDescription.and.returnValue(false);
        matDialog.open.and.returnValue(dialogRefSpy);
        dialogRefSpy.afterClosed.and.returnValue(of(mockGame));

        component.onSaveClick();

        expect(matDialog.open).toHaveBeenCalled();
        expect(gameMapDataManagerService.save).not.toHaveBeenCalled();
    });

    it('should return ALERT state if name and description are invalid in getOptionsNotificationState', () => {
        gameMapDataManagerService.hasValidNameAndDescription.and.returnValue(false);

        const result = component.getOptionsNotificationState();
        expect(result).toBe(ButtonNotificationState.ALERT);
    });

    it('should return HIDDEN state if name and description are valid in getOptionsNotificationState', () => {
        gameMapDataManagerService.hasValidNameAndDescription.and.returnValue(true);

        const result = component.getOptionsNotificationState();
        expect(result).toBe(ButtonNotificationState.HIDDEN);
    });

    it('should return correct save notification state', () => {
        gameMapDataManagerService.isSavedGame.and.returnValue(false);
        gameMapDataManagerService.isGameUpdated = false;
        expect(component.getSaveNotificationState()).toBe(ButtonNotificationState.ALERT);

        gameMapDataManagerService.isSavedGame.and.returnValue(true);
        gameMapDataManagerService.isGameUpdated = true;
        expect(component.getSaveNotificationState()).toBe(ButtonNotificationState.WARNING);

        gameMapDataManagerService.isSavedGame.and.returnValue(true);
        gameMapDataManagerService.isGameUpdated = false;
        expect(component.getSaveNotificationState()).toBe(ButtonNotificationState.SUCCESS);
    });

    it('should return correct options notification description', () => {
        gameMapDataManagerService.hasValidNameAndDescription.and.returnValue(false);
        expect(component.getOptionsNotificationDescription()).toBe('Il faut donner un nom et une description à la carte');

        gameMapDataManagerService.hasValidNameAndDescription.and.returnValue(true);
        expect(component.getOptionsNotificationDescription()).toBe('');
    });

    it('should return correct save notification description', () => {
        gameMapDataManagerService.isSavedGame.and.returnValue(false);
        expect(component.getSaveNotificationDescription()).toBe("La carte n'est pas sauvegardée");

        gameMapDataManagerService.isSavedGame.and.returnValue(true);
        gameMapDataManagerService.isGameUpdated = true;
        expect(component.getSaveNotificationDescription()).toBe('La carte a été modifiée');

        gameMapDataManagerService.isSavedGame.and.returnValue(true);
        gameMapDataManagerService.isGameUpdated = false;
        expect(component.getSaveNotificationDescription()).toBe('La carte est sauvegardée');
    });
});
