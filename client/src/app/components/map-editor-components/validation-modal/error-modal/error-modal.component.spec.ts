import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorModalComponent } from './error-modal.component';

describe('ErrorModalComponent', () => {
  let component: ErrorModalComponent;
  let fixture: ComponentFixture<ErrorModalComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ErrorModalComponent>>;

  beforeEach(async () => {
    // Create a spy for MatDialogRef to mock its behavior
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ErrorModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy }, // Mock MatDialogRef
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Test error message' } }, // Provide mock data for the dialog
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call dialogRef.close() when close() is called', () => {
    component.close(); // Call the close method
    expect(dialogRefSpy.close).toHaveBeenCalled(); // Ensure close() is called on the MatDialogRef spy
  });
});
