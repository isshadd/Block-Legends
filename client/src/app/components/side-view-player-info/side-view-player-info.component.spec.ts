import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { SideViewPlayerInfoComponent } from './side-view-player-info.component';

describe('SideViewPlayerInfoComponent', () => {
    let component: SideViewPlayerInfoComponent;
    let fixture: ComponentFixture<SideViewPlayerInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SideViewPlayerInfoComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SideViewPlayerInfoComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return correct healthArray based on player life attribute', () => {
        component.playerCharacter = new PlayerCharacter('test');
        fixture.detectChanges();
        const value = 4;
        expect(component.healthArray.length).toBe(value);
    });

    it('should return correct defenseArray based on player defense attribute', () => {
        component.playerCharacter = new PlayerCharacter('test');
        fixture.detectChanges();
        const value = 4;
        expect(component.defenseArray.length).toBe(value);
    });

    it('should return correct speedArray based on player speed attribute', () => {
        component.playerCharacter = new PlayerCharacter('test');
        fixture.detectChanges();
        const value = 4;
        expect(component.speedArray.length).toBe(value);
    });

    it('should return correct attackArray based on player attack attribute', () => {
        component.playerCharacter = new PlayerCharacter('test');
        fixture.detectChanges();
        const value = 4;
        expect(component.attackArray.length).toBe(value);
    });

    it('should set correct dice values in ngOnInit based on playerCharacter.dice', () => {
        component.playerCharacter = new PlayerCharacter('test');
        component.ngOnInit();
        expect(component.attackDice).toBe('(D6)');
        expect(component.defenseDice).toBe('(D4)');

        component.playerCharacter.dice = 'defense';
        component.ngOnInit();
        expect(component.attackDice).toBe('(D6)');
        expect(component.defenseDice).toBe('(D6)');
    });
});
