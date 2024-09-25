import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { CreateCharacterComponent } from './create-character.component';

describe('CreateCharacterComponent', () => {
    let component: CreateCharacterComponent;
    let fixture: ComponentFixture<CreateCharacterComponent>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            imports: [FormsModule, CreateCharacterComponent],
            providers: [{ provide: Router, useValue: mockRouter }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateCharacterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a character object with default values', () => {
        component.character = new PlayerCharacter('', '', new PlayerAttributes());
        expect(component.character.name).toBe('');
        expect(component.character.avatar).toBe('');
    });

    it('should not create a character if the character is not valid', () => {
        component.character = new PlayerCharacter('', '', new PlayerAttributes());
        component.createCharacter();
        expect(component.characterStatus).toBe(
            "Le formulaire de création de personnage n'est pas valide !" +
                " Manquants: Nom, Avatar, Bonus d'attaque, Bonus de défense, Bonus de vie, Bonus de vitesse.",
        );
    });

    it('should set the character to organizer and navigate to the waiting view if valid', () => {
        component.character = new PlayerCharacter('Test', 'test', new PlayerAttributes());
        component.character.isAttackBonusAssigned = true;
        component.character.isDefenseBonusAssigned = true;
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;
        component.createCharacter();
        expect(component.character.isOrganizer).toBeTrue();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/waiting-view']);
    });

    it('should open the modal', () => {
        component.openModal();
        expect(component.isModalOpen).toBeTrue();
    });

    it('should close the modal', () => {
        component.closeModal();
        expect(component.isModalOpen).toBeFalse();
    });

    it('should confirm back', () => {
        component.confirmBack();
        expect(component.isModalOpen).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/create-game']);
    });
});
