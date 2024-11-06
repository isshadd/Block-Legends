import { Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { PlayerMapEntityInfoViewComponent } from './player-map-entity-info-view.component';

describe('PlayerMapEntityInfoViewComponent', () => {
    let component: PlayerMapEntityInfoViewComponent;
    let fixture: ComponentFixture<PlayerMapEntityInfoViewComponent>;
    let mockPlayerCharacter: PlayerCharacter;

    beforeEach(async () => {
        mockPlayerCharacter = new PlayerCharacter('Hero');
        mockPlayerCharacter.attributes = {
            life: 5,
            defense: 3,
            speed: 4,
            attack: 2,
        };
        mockPlayerCharacter.avatar = AvatarEnum.Alex; // assuming you use avatar enum

        await TestBed.configureTestingModule({
            imports: [PlayerMapEntityInfoViewComponent],
            providers: [Renderer2],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerMapEntityInfoViewComponent);
        component = fixture.componentInstance;
        component.playerCharacter = mockPlayerCharacter;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return correct health array based on playerCharacter life attribute', () => {
        expect(component.healthArray.length).toBe(mockPlayerCharacter.attributes.life);
    });

    it('should return correct defense array based on playerCharacter defense attribute', () => {
        expect(component.defenseArray.length).toBe(mockPlayerCharacter.attributes.defense);
    });

    it('should return correct speed array based on playerCharacter speed attribute', () => {
        expect(component.speedArray.length).toBe(mockPlayerCharacter.attributes.speed);
    });

    it('should return correct attack array based on playerCharacter attack attribute', () => {
        expect(component.attackArray.length).toBe(mockPlayerCharacter.attributes.attack);
    });

    it('should emit close event when closePanel is called', () => {
        spyOn(component.closeP, 'emit');

        component.closePanel();

        expect(component.closeP.emit).toHaveBeenCalled();
    });
});
