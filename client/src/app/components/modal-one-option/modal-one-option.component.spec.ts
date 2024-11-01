import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalOneOptionComponent } from './modal-one-option.component';

describe('ModalOneOptionComponent', () => {
    let component: ModalOneOptionComponent;
    let fixture: ComponentFixture<ModalOneOptionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ModalOneOptionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ModalOneOptionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values for title, message, and confirmText', () => {
        expect(component.title).toBe('');
        expect(component.message).toBe('');
        expect(component.confirmText).toBe('Fermer');
    });

    it('should display input values for title, message, and confirmText', () => {
        component.title = 'Test Title';
        component.message = 'Test Message';
        component.confirmText = 'Confirm';

        fixture.detectChanges();

        const titleElement = fixture.nativeElement.querySelector('h2');
        const messageElement = fixture.nativeElement.querySelector('p');
        const confirmButton = fixture.nativeElement.querySelector('.modal-buttons button');

        expect(titleElement.textContent).toContain('Test Title');
        expect(messageElement.textContent).toContain('Test Message');
        expect(confirmButton.textContent).toContain('Confirm');
    });

    it('should emit confirm event when onConfirm is called', () => {
        spyOn(component.confirm, 'emit');

        component.onConfirm();

        expect(component.confirm.emit).toHaveBeenCalled();
    });
});
