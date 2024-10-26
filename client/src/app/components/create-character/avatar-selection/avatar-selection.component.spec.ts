import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
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
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize avatarList with an available avatar', () => {
        component.setAvatars();
        expect(component.avatarList).toContain(AvatarEnum.Steve);
    });

    it('should set the selected avatar on the player character', () => {
        const mockCharacter = new PlayerCharacter('TestCharacter', new PlayerAttributes());
        component.character = mockCharacter;

        const selectedAvatar = AvatarEnum.Steve;
        component.selectAvatar(selectedAvatar);

        expect(component.character.avatar).toBe(selectedAvatar);
    });
});
