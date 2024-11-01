import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { FightViewComponent } from './fight-view.component';

const DELAY = 300;
const ATTACK_ARRAY = 8;
const DEFENSE_ARRAY = 4;
const LIFE1 = 10;
const DEFENSE1 = 5;
const SPEED1 = 8;
const ATTACK1 = 6;
const LIFE2 = 8;
const DEFENSE2 = 4;
const SPEED2 = 7;
const ATTACK2 = 5;

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

        mockPlayer = new PlayerCharacter('testPlayer');
        mockPlayer.attributes = { life: LIFE1, defense: DEFENSE1, speed: SPEED1, attack: ATTACK1 };
        mockPlayer.avatar = AvatarEnum.Steve;

        mockOpponent = new PlayerCharacter('testOpponent');
        mockOpponent.attributes = { life: LIFE2, defense: DEFENSE2, speed: SPEED2, attack: ATTACK2 };
        mockOpponent.avatar = AvatarEnum.Alex;

        component.playerCharacter = mockPlayer;
        component.opponentCharacter = mockOpponent;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should emit attack event and apply attack classes when onAttack is called', fakeAsync(() => {
        spyOn(component.attack, 'emit');

        const playerImage = fixture.debugElement.nativeElement.querySelector('#player');
        const opponentImage = fixture.debugElement.nativeElement.querySelector('#opponent');

        component.onAttack();
        fixture.detectChanges(); // Trigger change detection to apply the class

        expect(component.attack.emit).toHaveBeenCalled();
        expect(playerImage.classList).toContain('attack-player');
        expect(opponentImage.classList).toContain('attack-opponent');

        tick(DELAY); // Simulate 300 ms delay
        fixture.detectChanges(); // Trigger change detection again to remove the class

        expect(playerImage.classList).not.toContain('attack-player');
        expect(opponentImage.classList).not.toContain('attack-opponent');
    }));

    it('should emit escape event when onEscape is called', () => {
        spyOn(component.escape, 'emit');

        component.onEscape();

        expect(component.escape.emit).toHaveBeenCalled();
    });

    it('should return an array of the correct length for healthArray', () => {
        expect(component.healthArray.length).toBe(ATTACK_ARRAY);
    });

    it('should return an array of the correct length for defenseArray', () => {
        expect(component.defenseArray.length).toBe(DEFENSE_ARRAY);
    });
});
