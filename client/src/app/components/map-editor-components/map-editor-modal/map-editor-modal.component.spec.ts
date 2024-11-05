import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { MapEditorModalComponent } from './map-editor-modal.component';

describe('MapEditorModalComponent', () => {
    let component: MapEditorModalComponent;
    let fixture: ComponentFixture<MapEditorModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<MapEditorModalComponent>>;
    let gameMapDataManagerServiceSpy: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(async () => {
        const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        const gameMapDataManagerSpy = jasmine.createSpyObj('GameMapDataManagerService', ['saveGame']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, MapEditorModalComponent, BrowserAnimationsModule],
            providers: [
                FormBuilder,
                { provide: MatDialogRef, useValue: dialogSpy },
                { provide: GameMapDataManagerService, useValue: gameMapDataManagerSpy },
                { provide: MAT_DIALOG_DATA, useValue: { name: 'Test Game', description: 'Test Description' } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MapEditorModalComponent);
        component = fixture.componentInstance;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<MapEditorModalComponent>>;
        gameMapDataManagerServiceSpy = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with data from MAT_DIALOG_DATA', () => {
        expect(component.infoForm.get('name')?.value).toBe('Test Game');
        expect(component.infoForm.get('description')?.value).toBe('Test Description');
    });

    it('should close the dialog without returning data when onCloseClick is called', () => {
        component.onCloseClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
        expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });

    it('should close the dialog with form data and isSavedPressed: false when onOkClick is called and form is valid', () => {
        component.infoForm.setValue({ name: 'Updated Name', description: 'Updated Description' });
        component.onOkClick();
        expect(dialogRefSpy.close).toHaveBeenCalledWith({
            name: 'Updated Name',
            description: 'Updated Description',
            isSavedPressed: false,
        });
    });

    it('should not close the dialog with data when onOkClick is called and form is invalid', () => {
        component.infoForm.setValue({ name: '', description: 'Updated Description' }); // Invalid due to empty name
        component.onOkClick();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('should save the game and close the dialog with form data and isSavedPressed: true when onSaveClick is called', () => {
        component.infoForm.setValue({ name: 'Updated Name', description: 'Updated Description' });
        component.onSaveClick();
        expect(gameMapDataManagerServiceSpy.saveGame).toHaveBeenCalled(); // Ensure saveGame is called
        expect(dialogRefSpy.close).toHaveBeenCalledWith({
            name: 'Updated Name',
            description: 'Updated Description',
            isSavedPressed: true,
        });
    });
});
