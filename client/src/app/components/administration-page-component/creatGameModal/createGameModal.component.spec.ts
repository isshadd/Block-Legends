import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateGameModalComponent } from './createGameModal.component';

describe('CreateGameModalComponent', () => {
    let component: CreateGameModalComponent;
    let fixture: ComponentFixture<CreateGameModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateGameModalComponent>>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [CreateGameModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateGameModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog on onNoClick', () => {
        component.onNoClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });

    it('should navigate to /map-editor and close the dialog on onCreateClick if size is selected', () => {
        component.selectedSize = 'medium';
        component.onCreateClick();
        expect(dialogRefSpy.close).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/map-editor']);
    });

    it('should not navigate to /map-editor on onCreateClick if size is not selected', () => {
        component.selectedSize = null;
        component.onCreateClick();
        expect(dialogRefSpy.close).not.toHaveBeenCalled();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should set selectedSize and log the selected size on selectSize', () => {
        const size = 'large';
        component.selectSize(size);
        expect(component.selectedSize).toBe(size);
    });
});
