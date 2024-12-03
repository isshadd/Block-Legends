import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MapEditorModalComponent } from '@app/components/map-editor-components/map-editor-modal/map-editor-modal.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager/map-editor-manager.service';
import { GameShared } from '@common/interfaces/game-shared';
import { of } from 'rxjs';
import { MapEditorOptionsMenuComponent } from './map-editor-options-menu.component';

describe('MapEditorOptionsMenuComponent', () => {
    let component: MapEditorOptionsMenuComponent;
    let fixture: ComponentFixture<MapEditorOptionsMenuComponent>;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;
    let mapEditorManagerServiceSpy: jasmine.SpyObj<MapEditorManagerService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<MapEditorModalComponent>>;
    let dialog: jasmine.SpyObj<MatDialog>;

    beforeEach(async () => {
        const gameMapDataManagerSpy = jasmine.createSpyObj('GameMapDataManagerService', ['resetGame', 'hasValidNameAndDescription', 'saveGame']);
        const mapEditorManagerSpy = jasmine.createSpyObj('MapEditorManagerService', ['itemCheckup']);
        const matDialogSpyObj = jasmine.createSpyObj('MatDialog', ['open']);
        const matDialogRefSpyObj = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            imports: [MapEditorOptionsMenuComponent],
            providers: [
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerSpy },
                { provide: MapEditorManagerService, useValue: mapEditorManagerSpy },
                { provide: MatDialog, useValue: matDialogSpyObj },
                { provide: MatDialog, useValue: dialogSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MapEditorOptionsMenuComponent);
        component = fixture.componentInstance;
        gameMapDataManagerServiceSpy = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;
        mapEditorManagerServiceSpy = TestBed.inject(MapEditorManagerService) as jasmine.SpyObj<MapEditorManagerService>;
        matDialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        matDialogRefSpy = matDialogRefSpyObj;
        dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

        matDialogSpy.open.and.returnValue(matDialogRefSpy as MatDialogRef<MapEditorModalComponent>);
    });

    it('should open the options dialog when onOptionsClick is called', () => {
        gameMapDataManagerServiceSpy.currentName = 'Test Game';
        gameMapDataManagerServiceSpy.currentDescription = 'Test Description';

        const mockDialogRef = {
            afterClosed: () => of({ name: 'Test Game', description: 'Test Description' }),
        } as MatDialogRef<MapEditorModalComponent>;

        matDialogSpy.open.and.returnValue(mockDialogRef);

        component.onOptionsClick();

        expect(matDialogSpy.open).toHaveBeenCalledWith(MapEditorModalComponent, {
            data: { name: 'Test Game', description: 'Test Description' },
        });
    });

    it('should update the game name and description after the dialog is closed', () => {
        gameMapDataManagerServiceSpy.currentName = 'Test Game';
        gameMapDataManagerServiceSpy.currentDescription = 'Test Description';

        const mockDialogRef = {
            afterClosed: () => of({ name: 'Updated Game', description: 'Updated Description' } as GameShared),
        } as MatDialogRef<MapEditorModalComponent>;

        matDialogSpy.open.and.returnValue(mockDialogRef);

        component.onOptionsClick();

        expect(matDialogSpy.open).toHaveBeenCalled();

        expect(gameMapDataManagerServiceSpy.currentName).toBe('Updated Game');
        expect(gameMapDataManagerServiceSpy.currentDescription).toBe('Updated Description');
    });

    it('should not update the game name and description if the dialog result is null or undefined', () => {
        gameMapDataManagerServiceSpy.currentName = 'Test Game';
        gameMapDataManagerServiceSpy.currentDescription = 'Test Description';

        const mockDialogRef = {
            afterClosed: () => of(null),
        } as MatDialogRef<MapEditorModalComponent>;

        matDialogSpy.open.and.returnValue(mockDialogRef);

        component.onOptionsClick();

        expect(matDialogSpy.open).toHaveBeenCalled();

        expect(gameMapDataManagerServiceSpy.currentName).toBe('Test Game');
        expect(gameMapDataManagerServiceSpy.currentDescription).toBe('Test Description');
    });

    it('should reset the game and call itemCheckup in mapEditorManagerService', () => {
        component.onResetClick();

        expect(gameMapDataManagerServiceSpy.resetGame).toHaveBeenCalled();
        expect(mapEditorManagerServiceSpy.itemCheckup).toHaveBeenCalled();
    });

    it('should open the options dialog if name or description is invalid', () => {
        const mockDialogRef = {
            afterClosed: () => of(null),
        } as MatDialogRef<MapEditorModalComponent>;

        matDialogSpy.open.and.returnValue(mockDialogRef);

        gameMapDataManagerServiceSpy.hasValidNameAndDescription.and.returnValue(false);

        component.onSaveClick();

        expect(matDialogSpy.open).toHaveBeenCalled();
        expect(gameMapDataManagerServiceSpy.saveGame).not.toHaveBeenCalled();
    });

    it('should save the game if name and description are valid', () => {
        gameMapDataManagerServiceSpy.hasValidNameAndDescription.and.returnValue(true);

        component.onSaveClick();

        expect(matDialogSpy.open).not.toHaveBeenCalled();
        expect(gameMapDataManagerServiceSpy.saveGame).toHaveBeenCalled();
    });

    it('should call onSaveClick if isSavedPressed is true in the dialog result', () => {
        spyOn(component, 'onSaveClick');

        const dialogRefSpy = jasmine.createSpyObj({ afterClosed: of({ name: 'New Name', description: 'New Description', isSavedPressed: true }) });
        dialog.open.and.returnValue(dialogRefSpy);

        component.onOptionsClick();

        expect(component.onSaveClick).toHaveBeenCalled();
    });
});
