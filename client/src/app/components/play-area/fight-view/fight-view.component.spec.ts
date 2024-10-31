import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { FightViewComponent } from './fight-view.component';

describe('FightViewComponent', () => {
    let component: FightViewComponent;
    let fixture: ComponentFixture<FightViewComponent>;
    let mockPlayer: PlayerCharacter;
    let mockOpponent: PlayerCharacter;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FightViewComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FightViewComponent);
        component = fixture.componentInstance;

        mockPlayer = new PlayerCharacter('test');
        mockPlayer.attributes = { life: 10, defense: 5, speed: 8, attack: 6 };

        mockOpponent = new PlayerCharacter('test');
        mockOpponent.attributes = { life: 8, defense: 4, speed: 7, attack: 5 };

        component.playerCharacter = mockPlayer;
        component.opponentCharacter = mockOpponent;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit attack event and apply attack classes when onAttack is called', fakeAsync(() => {
        spyOn(component.attack, 'emit');

        const playerImage = document.createElement('div');
        playerImage.id = 'player';
        document.body.appendChild(playerImage);

        const opponentImage = document.createElement('div');
        opponentImage.id = 'opponent';
        document.body.appendChild(opponentImage);

        component.onAttack();

        expect(component.attack.emit).toHaveBeenCalled();
        expect(playerImage.classList).toContain('attack-player');
        expect(opponentImage.classList).toContain('attack-opponent');

        tick(300);
        expect(playerImage.classList).not.toContain('attack-player');
        expect(opponentImage.classList).not.toContain('attack-opponent');

        document.body.removeChild(playerImage);
        document.body.removeChild(opponentImage);
    }));

    it('should emit escape event when onEscape is called', () => {
        spyOn(component.escape, 'emit');

        component.onEscape();

        expect(component.escape.emit).toHaveBeenCalled();
    });

    it('should return an array of the correct length for healthArray', () => {
        expect(component.healthArray.length).toBe(8);
    });

    it('should return an array of the correct length for defenseArray', () => {
        expect(component.defenseArray.length).toBe(4);
    });
});
