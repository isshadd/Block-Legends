import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMode } from '@common/enums/game-mode';
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
        const mode = GameMode.Classique;
        component.selectMode(mode);
        expect(component.selectedMode).toEqual(mode);
    });
});
