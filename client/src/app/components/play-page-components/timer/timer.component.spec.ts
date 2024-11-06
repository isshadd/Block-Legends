import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerComponent } from './timer.component';

describe('TimerComponent', () => {
    let component: TimerComponent;
    let fixture: ComponentFixture<TimerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TimerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TimerComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return "Combat en cours" when isBattle is true', () => {
        component.isBattle = true;
        const formattedTime = component.formatTime();

        expect(formattedTime).toBe('Combat en cours');
    });

    it('should return formatted time with player name and seconds when isBattle is false', () => {
        component.isBattle = false;
        component.playerTurnName = 'Player 1';
        component.seconds = 30;

        const formattedTime = component.formatTime();

        expect(formattedTime).toBe('Player 1 30');
    });
});
