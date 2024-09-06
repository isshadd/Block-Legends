import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationGameComponent } from './administration-game.component';

describe('AdministrationGameComponent', () => {
    let component: AdministrationGameComponent;
    let fixture: ComponentFixture<AdministrationGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdministrationGameComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AdministrationGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
