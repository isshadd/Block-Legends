import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WinPanelComponent } from './win-panel.component';

describe('WinPanelComponent', () => {
    let component: WinPanelComponent;
    let fixture: ComponentFixture<WinPanelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WinPanelComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(WinPanelComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });
});
