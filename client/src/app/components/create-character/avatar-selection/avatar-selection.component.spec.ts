import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameListComponent } from '@app/components/create-game/game-list/game-list/game-list.component';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { Subject } from 'rxjs';
import { AvatarSelectionComponent } from './avatar-selection.component';

class MockWebSocketService {
    takenAvatarsSubject = new Subject<string[]>();
    takenAvatars$ = this.takenAvatarsSubject.asObservable();

    emitTakenAvatars(avatars: string[]) {
        this.takenAvatarsSubject.next(avatars);
    }
}

describe('AvatarSelectionComponent', () => {
    let component: AvatarSelectionComponent;
    let fixture: ComponentFixture<AvatarSelectionComponent>;
    let mockWebSocketService: MockWebSocketService;

    beforeEach(async () => {
        mockWebSocketService = new MockWebSocketService();

        await TestBed.configureTestingModule({
            imports: [CommonModule, AvatarSelectionComponent, GameListComponent],
            providers: [{ provide: WebSocketService, useValue: mockWebSocketService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AvatarSelectionComponent);
        component = fixture.componentInstance;
        component.character = { avatar: null } as unknown as PlayerCharacter;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize avatarList correctly', () => {
        const expectedAvatars = Object.keys(AvatarEnum).map((key) => AvatarEnum[key as keyof typeof AvatarEnum]);
        expect(component.avatarList).toEqual(expectedAvatars);
    });

    it('should filter out taken avatars from the avatarList', () => {
        component.takenAvatars = [AvatarEnum.Steve.name];
        component.avatarList = [AvatarEnum.Steve, AvatarEnum.Alex];

        component.filterAvatars();

        expect(component.avatarList).not.toContain(AvatarEnum.Steve);
        expect(component.avatarList).toContain(AvatarEnum.Alex);
    });

    it('should initialize avatarList with all avatars before any taken avatars are emitted', () => {
        const allAvatars = Object.keys(AvatarEnum).map((key) => AvatarEnum[key as keyof typeof AvatarEnum]);

        expect(component.avatarList).toEqual(allAvatars);
    });

    it('should set the selected avatar on the player character', () => {
        const mockCharacter = { avatar: null } as unknown as PlayerCharacter;
        component.character = mockCharacter;
        const selectedAvatar = AvatarEnum.Steve;

        component.selectAvatar(selectedAvatar);

        expect(component.character.avatar).toBe(selectedAvatar);
    });

    it('should update takenAvatars and filter avatarList when takenAvatars$ emits', () => {
        const takenAvatars = [AvatarEnum.Arlina.name];
        const expectedFilteredAvatars = Object.keys(AvatarEnum)
            .map((key) => AvatarEnum[key as keyof typeof AvatarEnum])
            .filter((avatar) => avatar !== AvatarEnum.Arlina);

        mockWebSocketService.emitTakenAvatars(takenAvatars);
        fixture.detectChanges();

        expect(component.takenAvatars).toEqual(takenAvatars);
        expect(component.avatarList).toEqual(expectedFilteredAvatars);
    });

    it('should not modify avatarList if takenAvatars is empty', () => {
        const takenAvatars: string[] = [];
        const expectedAvatars = Object.keys(AvatarEnum).map((key) => AvatarEnum[key as keyof typeof AvatarEnum]);

        mockWebSocketService.emitTakenAvatars(takenAvatars);
        fixture.detectChanges();

        expect(component.takenAvatars).toEqual(takenAvatars);
        expect(component.avatarList).toEqual(expectedAvatars);
    });

    it('should handle null or undefined takenAvatars gracefully', () => {
        const takenAvatars: string[] = [];

        mockWebSocketService.emitTakenAvatars(takenAvatars);
        fixture.detectChanges();

        expect(component.takenAvatars).toEqual(takenAvatars);
        expect(component.avatarList).toEqual(Object.keys(AvatarEnum).map((key) => AvatarEnum[key as keyof typeof AvatarEnum]));
    });
});
