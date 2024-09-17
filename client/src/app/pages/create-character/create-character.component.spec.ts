import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BASE_STATS, BONUS_LIFE, BONUS_SPEED, CreateCharacterComponent } from './create-character.component';

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
        expect(component.character).toEqual({
            name: '', // à changer plus tard
            avatar: '', // à changer plus tard
            life: 4,
            speed: 4,
            attack: 4,
            defense: 4,
        });
    });

    it('should assign bonus to life', () => {
        component.bonusAttribute = 'life';
        component.assignBonus();
        expect(component.character.life).toBe(BONUS_LIFE);
        expect(component.character.speed).toBe(BASE_STATS);
    });

    it('should assign bonus to speed', () => {
        component.bonusAttribute = 'speed';
        component.assignBonus();
        expect(component.character.speed).toBe(BONUS_SPEED);
        expect(component.character.life).toBe(BASE_STATS);
    });

    it('should not allow submission if the form is incomplete', () => {
        component.isAttackDiceAssigned = false;
        component.isDefenseDiceAssigned = false;
        component.isLifeOrSpeedBonusAssigned = false;
        component.createCharacter();
        expect(component.characterStatus).toBe("Le formulaire de création de personnage n'est pas valide !");
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should allow submission if the form is complete', () => {
        // rate dans tous les cas car les avatars ne sont pas encore définis
        component.character.name = "Kha'Zix";
        component.character.avatar = component.avatars[0].imgSrc1;
        component.isAttackDiceAssigned = true;
        component.isDefenseDiceAssigned = true;
        component.isLifeOrSpeedBonusAssigned = true;
        component.createCharacter();
        expect(component.characterStatus).toBeUndefined();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/waiting-view']);
    });

    it('should assign dice to attack and defense and not allow another try', () => {
        component.diceAttribution('attack');
        expect(component.character.attack).toBeGreaterThan(BASE_STATS);
        expect(component.character.defense).toBeGreaterThan(BASE_STATS);
        expect(component.isAttackDiceAssigned).toBeTrue();
        expect(component.isDefenseDiceAssigned).toBeTrue();
    });

    it('should assign dice to attack and defense and not allow another try', () => {
        component.diceAttribution('defense');
        expect(component.character.attack).toBeGreaterThan(BASE_STATS);
        expect(component.character.defense).toBeGreaterThan(BASE_STATS);
        expect(component.isAttackDiceAssigned).toBeTrue();
        expect(component.isDefenseDiceAssigned).toBeTrue();
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

    it('should select an avatar', () => {
        component.selectAvatar(component.avatars[0].imgSrc1);
        expect(component.character.avatar).toBe(component.avatars[0].imgSrc1);
    });

    it('should get the selected avatar', () => {
        component.character.avatar = component.avatars[0].imgSrc1;
        expect(component.getSelectedAvatar()).toBe(component.avatars[0]);
    });
});
