import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfosGameComponent } from './infos-game.component';

describe('InfosGameComponent', () => {
    let component: InfosGameComponent;
    let fixture: ComponentFixture<InfosGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfosGameComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(InfosGameComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should display the correct number of players', () => {
        component.nbrPlayers = 3; // Assign a value
        fixture.detectChanges(); // Trigger change detection
        const compiled = fixture.nativeElement; // Access the DOM element

        expect(compiled.querySelector('p').textContent).toContain('Number of Players: 3');
    });

    it('should display the current player', () => {
        component.currentPlayer = 'Alice'; // Assign a value
        fixture.detectChanges(); // Trigger change detection
        const compiled = fixture.nativeElement; // Access the DOM element

        expect(compiled.querySelector('p').textContent).toContain('Current Player: Alice');
    });

    it('should display the game board correctly', () => {
        component.game = [
            // Ensure game is initialized
            [
                { id: '1', letter: 'A' },
                { id: '2', letter: 'B' },
            ],
            [
                { id: '3', letter: 'C' },
                { id: '4', letter: 'D' },
            ],
        ];
        fixture.detectChanges(); // Trigger change detection
        const compiled = fixture.nativeElement; // Access the DOM element

        expect(compiled.textContent).toContain('A');
        expect(compiled.textContent).toContain('B');
        expect(compiled.textContent).toContain('C');
        expect(compiled.textContent).toContain('D');
    });
});
