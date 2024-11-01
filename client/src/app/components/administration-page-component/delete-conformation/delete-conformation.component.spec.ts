import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from './delete-conformation.component';

describe('DeleteConfirmationComponent', () => {
    let component: DeleteConfirmationComponent;
    let fixture: ComponentFixture<DeleteConfirmationComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DeleteConfirmationComponent>>;

    beforeEach(async () => {
        const dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            imports: [DeleteConfirmationComponent],
            providers: [{ provide: MatDialogRef, useValue: dialogSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteConfirmationComponent);
        component = fixture.componentInstance;
        dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<DeleteConfirmationComponent>>;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog when closeConfirmation is called', () => {
        component.closeConfirmation();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
