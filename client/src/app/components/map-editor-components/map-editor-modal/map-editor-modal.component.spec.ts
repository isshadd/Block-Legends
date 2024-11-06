import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MapEditorModalComponent } from './map-editor-modal.component';

describe('MapEditorModalComponent', () => {
    let component: MapEditorModalComponent;
    let fixture: ComponentFixture<MapEditorModalComponent>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<MapEditorModalComponent>>;
    const mockDialogData = {
        name: 'Initial Name',
        description: 'Initial Description',
    };

    beforeEach(async () => {
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [MapEditorModalComponent, ReactiveFormsModule, FormsModule, NoopAnimationsModule],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MapEditorModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with provided data', () => {
        const form = component.infoForm;
        expect(form).toBeTruthy();
        expect(form.get('name')?.value).toBe(mockDialogData.name);
        expect(form.get('description')?.value).toBe(mockDialogData.description);
    });

    it('should require the name field and enforce maximum length', () => {
        const nameControl = component.infoForm.get('name');

        nameControl?.setValue('');
        expect(nameControl?.valid).toBeFalse();
        expect(nameControl?.hasError('required')).toBeTrue();

        const longName = 'a'.repeat(component.nameMaxLength + 1);
        nameControl?.setValue(longName);
        expect(nameControl?.valid).toBeFalse();
        expect(nameControl?.hasError('maxlength')).toBeTrue();

        const validName = 'Valid Name';
        nameControl?.setValue(validName);
        expect(nameControl?.valid).toBeTrue();
    });

    it('should require the description field and enforce maximum length', () => {
        const descriptionControl = component.infoForm.get('description');

        descriptionControl?.setValue('');
        expect(descriptionControl?.valid).toBeFalse();
        expect(descriptionControl?.hasError('required')).toBeTrue();

        const longDescription = 'a'.repeat(component.descriptionMaxLenght + 1); // Corrected property name
        descriptionControl?.setValue(longDescription);
        expect(descriptionControl?.valid).toBeFalse();
        expect(descriptionControl?.hasError('maxlength')).toBeTrue();

        const validDescription = 'Valid Description';
        descriptionControl?.setValue(validDescription);
        expect(descriptionControl?.valid).toBeTrue();
    });

    it('should close the dialog when onCloseClick is called', () => {
        component.onCloseClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close the dialog with form data and isSavedPressed: false when onOkClick is called and form is valid', () => {
        component.infoForm.setValue({
            name: 'Updated Name',
            description: 'Updated Description',
        });
        expect(component.infoForm.valid).toBeTrue();

        component.onOkClick();

        expect(mockDialogRef.close).toHaveBeenCalledWith({
            name: 'Updated Name',
            description: 'Updated Description',
            isSavedPressed: false,
        });
    });

    it('should close the dialog with form data and isSavedPressed: true when onSaveClick is called and form is valid', () => {
        component.infoForm.setValue({
            name: 'Another Name',
            description: 'Another Description',
        });
        expect(component.infoForm.valid).toBeTrue();

        component.onSaveClick();

        expect(mockDialogRef.close).toHaveBeenCalledWith({
            name: 'Another Name',
            description: 'Another Description',
            isSavedPressed: true,
        });
    });

    it('should not close the dialog when onOkClick is called and form is invalid', () => {
        component.infoForm.setValue({
            name: '',
            description: '',
        });
        expect(component.infoForm.invalid).toBeTrue();

        component.onOkClick();

        expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close the dialog when onSaveClick is called even if form is invalid', () => {
        component.infoForm.setValue({
            name: '',
            description: '',
        });
        expect(component.infoForm.invalid).toBeTrue();

        component.onSaveClick();

        expect(mockDialogRef.close).toHaveBeenCalledWith({
            name: '',
            description: '',
            isSavedPressed: true,
        });
    });
});
