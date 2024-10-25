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

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
