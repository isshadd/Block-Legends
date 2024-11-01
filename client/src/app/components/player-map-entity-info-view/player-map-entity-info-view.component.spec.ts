import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { PlayerMapEntityInfoViewComponent } from './player-map-entity-info-view.component';

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
        component.playerCharacter.attributes = {
            life: 5,
            defense: 3,
            speed: 4,
            attack: 6,
        };
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return an array of the correct length for healthArray', () => {
        expect(component.healthArray.length).toBe(5);
    });

    it('should return an array of the correct length for defenseArray', () => {
        expect(component.defenseArray.length).toBe(3);
    });

    it('should return an array of the correct length for speedArray', () => {
        expect(component.speedArray.length).toBe(4);
    });

    it('should return an array of the correct length for attackArray', () => {
        expect(component.attackArray.length).toBe(6);
    });
});
