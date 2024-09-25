import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AvatarSelectionComponent } from './avatar-selection.component';

describe('AvatarSelectionComponent', () => {
    let component: AvatarSelectionComponent;
    let fixture: ComponentFixture<AvatarSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AvatarSelectionComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarSelectionComponent);
        component = fixture.componentInstance;

        component.character = new PlayerCharacter('Nom du personnage', '', new PlayerAttributes());

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should select an avatar', () => {
        const avatars = [{ name: "Kha'Zix", imgSrc1: 'assets/images/avatar/Khazix.webp', imgSrc2: 'assets/images/avatar/Khazix2.webp' }];
        component.selectAvatar(avatars[0].imgSrc1);
        expect(component.character.avatar).toBe(avatars[0].imgSrc1);
    });

    it('should get the selected avatar', () => {
        const avatars = [{ name: "Kha'Zix", imgSrc1: 'assets/images/avatar/Khazix.webp', imgSrc2: 'assets/images/avatar/Khazix2.webp' }];
        component.character.avatar = avatars[0].imgSrc1;
        expect(component.getSelectedAvatar()).toEqual(avatars[0]);
    });
});
