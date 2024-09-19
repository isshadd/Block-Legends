import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisibleStateComponent } from './visible-state.component';

describe('EntityContainerComponent', () => {
    let component: VisibleStateComponent;
    let fixture: ComponentFixture<VisibleStateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VisibleStateComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VisibleStateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
