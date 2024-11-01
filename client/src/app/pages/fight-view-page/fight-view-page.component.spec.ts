import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FightViewPageComponent } from './fight-view-page.component';

describe('FightViewPageComponent', () => {
    let component: FightViewPageComponent;
    let fixture: ComponentFixture<FightViewPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FightViewPageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FightViewPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
