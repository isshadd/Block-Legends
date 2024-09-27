import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBarComponent } from './nav-bar.component';

describe('NavBarComponent', () => {
    let component: NavBarComponent;
    let fixture: ComponentFixture<NavBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NavBarComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(NavBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should select a mode', () => {
        const mode = 'Combat classique';
        component.selectMode(mode);
        expect(component.selectedMode).toEqual(mode);
    });
});
