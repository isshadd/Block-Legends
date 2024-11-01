import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MapEditorModalComponent } from './map-editor-modal.component';

describe('MapEditorModalComponent', () => {
    let component: MapEditorModalComponent;
    let fixture: ComponentFixture<MapEditorModalComponent>;
    let matDialogRef: jasmine.SpyObj<MatDialogRef<MapEditorModalComponent>>;
    const mockDialogData = { name: 'Test Game', description: 'Test Description' };

    beforeEach(async () => {
        const matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, NoopAnimationsModule, MapEditorModalComponent],
            providers: [FormBuilder, { provide: MatDialogRef, useValue: matDialogRefSpy }, { provide: MAT_DIALOG_DATA, useValue: mockDialogData }],
        }).compileComponents();

        fixture = TestBed.createComponent(MapEditorModalComponent);
        component = fixture.componentInstance;
        matDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<MapEditorModalComponent>>;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with dialog data', () => {
        expect(component.infoForm.value).toEqual({
            name: mockDialogData.name,
            description: mockDialogData.description,
        });
    });

    it('should close the dialog when onCloseClick is called', () => {
        component.onCloseClick();
        expect(matDialogRef.close).toHaveBeenCalled();
    });

    it('should close the dialog with form data when onSaveClick is called and the form is valid', () => {
        component.infoForm.setValue({
            name: 'New Game Name',
            description: 'New Game Description',
        });

        component.onOkClick();
        expect(matDialogRef.close).toHaveBeenCalledWith({
            name: 'New Game Name',
            description: 'New Game Description',
        });
    });

    it('should not close the dialog when onSaveClick is called and the form is invalid', () => {
        component.infoForm.setValue({
            name: '',
            description: 'Valid description',
        });

        component.onOkClick();
        expect(matDialogRef.close).not.toHaveBeenCalled();
    });

    it('should invalidate form when name exceeds max length', () => {
        component.infoForm.controls['name'].setValue('a'.repeat(component.nameMaxLength + 1));
        expect(component.infoForm.controls['name'].valid).toBeFalse();
    });

    it('should invalidate form when description exceeds max length', () => {
        component.infoForm.controls['description'].setValue('a'.repeat(component.descriptionMaxLenght + 1));
        expect(component.infoForm.controls['description'].valid).toBeFalse();
    });
});
