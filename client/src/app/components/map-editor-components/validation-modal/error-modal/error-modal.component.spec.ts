import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorModalComponent } from './error-modal.component';

describe('ErrorModalComponent', () => {
    let component: ErrorModalComponent;
    let fixture: ComponentFixture<ErrorModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ErrorModalComponent>>;

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [ErrorModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: { message: 'Test error message' } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call dialogRef.close() when close() is called', () => {
        component.close();
        dialogRefSpy.close.and.callThrough();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
