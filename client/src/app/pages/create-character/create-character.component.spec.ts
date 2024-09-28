import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AttributesComponent } from '@app/components/create-character/attributes/attributes.component';
import { AvatarSelectionComponent } from '@app/components/create-character/avatar-selection/avatar-selection.component';
import { CharacterFormComponent } from '@app/components/create-character/character-form/character-form.component';
import { ModalComponent } from '@app/components/modal/modal.component';
import { CreateCharacterComponent } from './create-character.component';

describe('CreateCharacterComponent', () => {
    let component: CreateCharacterComponent;
    let fixture: ComponentFixture<CreateCharacterComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockAvatar: jasmine.SpyObj<AvatarSelectionComponent>;
    let mockFormCharacter: jasmine.SpyObj<CharacterFormComponent>;
    let mockModal: jasmine.SpyObj<ModalComponent>;
    let mockAttributes: jasmine.SpyObj<AttributesComponent>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockAvatar = jasmine.createSpyObj('AvatarSelectionComponent', ['selectAvatar']);
        mockFormCharacter = jasmine.createSpyObj('CharacterFormComponent', ['saveName']);
        mockModal = jasmine.createSpyObj('ModalComponent', ['onConfirm', 'onCancel']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockAttributes = jasmine.createSpyObj('AttributesComponent', ['character', 'characterStatus']);
        await TestBed.configureTestingModule({
            imports: [FormsModule, CreateCharacterComponent, AvatarSelectionComponent, CharacterFormComponent, ModalComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: AvatarSelectionComponent, useValue: mockAvatar },
                { provide: CharacterFormComponent, useValue: mockFormCharacter },
                { provide: ModalComponent, useValue: mockModal },
                { provide: PlayerAttributes, useValue: mockAttributes },
            ],
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
            "Le formulaire de création de personnage n'est pas valide !" + ' Manquants: Nom, Avatar, Bonus de vie, Bonus de vitesse.',
        );
    });

    it('should not create a character if the character name is invalid', () => {
        component.character = new PlayerCharacter(' ', 'Test', mockAttributes.character.attributes);
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;
        component.createCharacter();
        expect(component.characterStatus).toBe('Le nom du personnage est invalide !');
    });

    it('should set the character to organizer and navigate to the waiting view if valid', () => {
        mockAttributes.character.attributes = new PlayerAttributes();
        component.character = new PlayerCharacter('Test', 'Test', mockAttributes.character.attributes);
        component.character.isNameValid = true;
        component.character.isAttackBonusAssigned = true;
        component.character.isDefenseBonusAssigned = true;
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;
        component.createCharacter();
        expect(mockAttributes.character.attributes).toEqual(component.character.attributes);
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

    it('should call selectAvatar on AvatarSelectionComponent when an avatar is selected', () => {
        component.character = new PlayerCharacter('Test', 'test-avatar', new PlayerAttributes());
        mockAvatar.selectAvatar('test-avatar');
        expect(mockAvatar.selectAvatar).toHaveBeenCalledWith('test-avatar');
    });

    it('should call saveName on CharacterFormComponent when name is saved', () => {
        component.character = new PlayerCharacter('Test', '', new PlayerAttributes());
        mockFormCharacter.saveName();
        expect(mockFormCharacter.saveName).toHaveBeenCalled();
    });

    it('should call onConfirm on ModalComponent when confirm button is clicked', () => {
        component.openModal();
        mockModal.onConfirm();
        expect(mockModal.onConfirm).toHaveBeenCalled();
    });

    it('should call onCancel on ModalComponent when cancel button is clicked', () => {
        component.openModal();
        mockModal.onCancel();
        expect(mockModal.onCancel).toHaveBeenCalled();
    });
});
