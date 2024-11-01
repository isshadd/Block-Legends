import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { PlayerMapEntityInfoViewComponent } from './player-map-entity-info-view.component';

const LIFE = 5;
const DEFENSE = 3;
const SPEED = 4;
const ATTACK = 6;

describe('PlayerMapEntityInfoViewComponent', () => {
    let component: PlayerMapEntityInfoViewComponent;
    let fixture: ComponentFixture<PlayerMapEntityInfoViewComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayerMapEntityInfoViewComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerMapEntityInfoViewComponent);
        component = fixture.componentInstance;

        component.playerCharacter = new PlayerCharacter('TestCharacter');
        component.playerCharacter.avatar = AvatarEnum.Steve;
        component.playerCharacter.attributes = {
            life: LIFE,
            defense: DEFENSE,
            speed: SPEED,
            attack: ATTACK,
        };
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return an array of the correct length for healthArray', () => {
        expect(component.healthArray.length).toBe(LIFE);
    });

    it('should return an array of the correct length for defenseArray', () => {
        expect(component.defenseArray.length).toBe(DEFENSE);
    });

    it('should return an array of the correct length for speedArray', () => {
        expect(component.speedArray.length).toBe(SPEED);
    });

    it('should return an array of the correct length for attackArray', () => {
        expect(component.attackArray.length).toBe(ATTACK);
    });
});
