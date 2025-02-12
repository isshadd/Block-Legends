import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerCharacter } from '@common/classes/Player/player-character';
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

        component.character = new PlayerCharacter('Nom du personnage');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
