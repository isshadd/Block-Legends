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
        // Create a mock for MatDialogRef with a spy on the 'close' method
        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [
                MapEditorModalComponent, // Correctly import the standalone component
                ReactiveFormsModule,
                FormsModule,
                NoopAnimationsModule, // Import NoopAnimationsModule to disable animations
            ],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
            ],
            schemas: [NO_ERRORS_SCHEMA], // Ignore unknown elements and attributes in the template
        }).compileComponents();

        fixture = TestBed.createComponent(MapEditorModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges(); // Trigger initial data binding
    });

    // **Test Case 1: Component Creation**
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // **Test Case 2: Form Initialization with Provided Data**
    it('should initialize the form with provided data', () => {
        const form = component.infoForm;
        expect(form).toBeTruthy();
        expect(form.get('name')?.value).toBe(mockDialogData.name);
        expect(form.get('description')?.value).toBe(mockDialogData.description);
    });

    // **Test Case 3: Form Validation - Name Field**
    it('should require the name field and enforce maximum length', () => {
        const nameControl = component.infoForm.get('name');

        // **Required Validator**
        nameControl?.setValue('');
        expect(nameControl?.valid).toBeFalse();
        expect(nameControl?.hasError('required')).toBeTrue();

        // **Max Length Validator**
        const longName = 'a'.repeat(component.nameMaxLength + 1);
        nameControl?.setValue(longName);
        expect(nameControl?.valid).toBeFalse();
        expect(nameControl?.hasError('maxlength')).toBeTrue();

        // **Valid Name**
        const validName = 'Valid Name';
        nameControl?.setValue(validName);
        expect(nameControl?.valid).toBeTrue();
    });

    // **Test Case 4: Form Validation - Description Field**
    it('should require the description field and enforce maximum length', () => {
        const descriptionControl = component.infoForm.get('description');

        // **Required Validator**
        descriptionControl?.setValue('');
        expect(descriptionControl?.valid).toBeFalse();
        expect(descriptionControl?.hasError('required')).toBeTrue();

        // **Max Length Validator**
        const longDescription = 'a'.repeat(component.descriptionMaxLenght + 1); // Corrected property name
        descriptionControl?.setValue(longDescription);
        expect(descriptionControl?.valid).toBeFalse();
        expect(descriptionControl?.hasError('maxlength')).toBeTrue();

        // **Valid Description**
        const validDescription = 'Valid Description';
        descriptionControl?.setValue(validDescription);
        expect(descriptionControl?.valid).toBeTrue();
    });

    // **Test Case 5: onCloseClick - Should Close Dialog Without Data**
    it('should close the dialog when onCloseClick is called', () => {
        component.onCloseClick();
        expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    // **Test Case 6: onOkClick - Should Close Dialog with Form Data and isSavedPressed: false**
    it('should close the dialog with form data and isSavedPressed: false when onOkClick is called and form is valid', () => {
        // Ensure the form is valid
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

    // **Test Case 7: onSaveClick - Should Close Dialog with Form Data and isSavedPressed: true**
    it('should close the dialog with form data and isSavedPressed: true when onSaveClick is called and form is valid', () => {
        // Ensure the form is valid
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

    // **Test Case 8: onOkClick - Should Not Close Dialog if Form is Invalid**
    it('should not close the dialog when onOkClick is called and form is invalid', () => {
        // Make the form invalid by clearing required fields
        component.infoForm.setValue({
            name: '',
            description: '',
        });
        expect(component.infoForm.invalid).toBeTrue();

        component.onOkClick();

        expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    // **Test Case 9: onSaveClick - Should Close Dialog Even If Form is Invalid**
    it('should close the dialog when onSaveClick is called even if form is invalid', () => {
        // Make the form invalid by clearing required fields
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

    // **Test Case 10: Button Clicks - Simulate User Interactions**
    // it('should handle button clicks correctly', () => {
    //     // Spy on component methods
    //     spyOn(component, 'onCloseClick').and.callThrough();
    //     spyOn(component, 'onOkClick').and.callThrough();
    //     spyOn(component, 'onSaveClick').and.callThrough();

    //     // Find buttons in the template using data-testid attributes
    //     const closeButton = fixture.debugElement.query(By.css('[data-testid="close-button"]'));
    //     const okButton = fixture.debugElement.query(By.css('[data-testid="ok-button"]'));
    //     const saveButton = fixture.debugElement.query(By.css('[data-testid="save-button"]'));

    //     // Ensure buttons are found
    //     expect(closeButton).toBeTruthy();
    //     expect(okButton).toBeTruthy();
    //     expect(saveButton).toBeTruthy();

    //     // Simulate button clicks
    //     closeButton.triggerEventHandler('click', null);
    //     okButton.triggerEventHandler('click', null);
    //     saveButton.triggerEventHandler('click', null);

    //     // Verify that component methods were called
    //     expect(component.onCloseClick).toHaveBeenCalled();
    //     expect(component.onOkClick).toHaveBeenCalled();
    //     expect(component.onSaveClick).toHaveBeenCalled();
    // });
});
