import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { CharacterFormComponent } from './character-form.component';

describe('CharacterFormComponent', () => {
    let component: CharacterFormComponent;
    let fixture: ComponentFixture<CharacterFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CharacterFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CharacterFormComponent);
        component = fixture.componentInstance;

        component.character = new PlayerCharacter('Nom du personnage', 'avatar-url', new PlayerAttributes());

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should save the name when valid', () => {
        component.character.name = 'ValidName';
        component.saveName();
        expect(component.savedName).toEqual('ValidName');
    });

    it('should validate the name correctly', () => {
        component.character.name = 'ValidName';
        component.saveName();
        expect(component.character.isNameValid).toBe(true);

        component.character.name = '    ';
        component.saveName();
        expect(component.character.isNameValid).toBe(false);

        component.character.name = '';
        component.saveName();
        expect(component.character.isNameValid).toBe(false);
    });
});
