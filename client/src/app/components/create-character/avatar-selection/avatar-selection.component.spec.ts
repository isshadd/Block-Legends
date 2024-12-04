import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarSelectionComponent } from './avatar-selection.component';
import { WebSocketService } from '@app/services/socket-service/websocket-service/websocket.service';
import { GameService } from '@app/services/game-services/game.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Avatar, AvatarEnum } from '@common/enums/avatar-enum';
import { BehaviorSubject } from 'rxjs';

const AMOUNT_OF_AVATARS = 24;

describe('AvatarSelectionComponent', () => {
    let component: AvatarSelectionComponent;
    let fixture: ComponentFixture<AvatarSelectionComponent>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let takenAvatarsSubject: BehaviorSubject<string[]>;

    const mockCharacter = new PlayerCharacter('TestPlayer');
    const mockAvatar: Avatar = {
        name: 'TestAvatar',
        headImage: 'head.png',
        fullImage: 'full.png',
        mineshaftImage: 'mineshaft.png',
        standing: 'standing.png',
        dogPetting: 'dogPetting.png',
        lost: 'lost.png',
        fight: 'fight.png',
    };

    beforeEach(async () => {
        takenAvatarsSubject = new BehaviorSubject<string[]>([]);

        webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', [], {
            takenAvatars$: takenAvatarsSubject.asObservable(),
        });

        gameServiceSpy = jasmine.createSpyObj('GameService', ['setSelectedAvatar']);

        await TestBed.configureTestingModule({
            imports: [AvatarSelectionComponent],
            providers: [
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarSelectionComponent);
        component = fixture.componentInstance;
        component.character = mockCharacter;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('setAvatars', () => {
        it('should initialize avatarList with all avatars from AvatarEnum', () => {
            component.setAvatars();

            expect(component.avatarList.length).toBe(AMOUNT_OF_AVATARS);
            expect(component.avatarList).toContain(Object.values(AvatarEnum)[0]);
        });
    });

    describe('filterAvatars', () => {
        it('should remove taken avatars from avatarList', () => {
            const takenAvatarName = Object.values(AvatarEnum)[0].name;
            component.takenAvatars = [takenAvatarName];

            component.filterAvatars();

            const filteredList = component.avatarList;
            expect(filteredList.find((avatar) => avatar.name === takenAvatarName)).toBeFalsy();
        });

        it('should not filter if takenAvatars is undefined', () => {
            const initialLength = component.avatarList.length;
            component.takenAvatars = undefined as unknown;

            component.filterAvatars();

            expect(component.avatarList.length).toBe(initialLength);
        });

        it('should keep untaken avatars in the list', () => {
            const untakenAvatar = Object.values(AvatarEnum)[0];
            const takenAvatar = Object.values(AvatarEnum)[1];
            component.takenAvatars = [takenAvatar.name];

            component.filterAvatars();

            expect(component.avatarList).toContain(untakenAvatar);
        });
    });

    describe('selectAvatar', () => {
        it('should set avatar for character and notify service', () => {
            component.selectAvatar(mockAvatar);

            expect(component.character.avatar).toBe(mockAvatar);
            expect(gameServiceSpy.setSelectedAvatar).toHaveBeenCalledWith(mockAvatar);
        });
    });

    describe('ngOnInit', () => {
        it('should update takenAvatars and filter list when receiving new taken avatars', () => {
            const takenAvatarName = Object.values(AvatarEnum)[0].name;
            spyOn(component, 'filterAvatars');

            takenAvatarsSubject.next([takenAvatarName]);

            expect(component.takenAvatars).toEqual([takenAvatarName]);
            expect(component.filterAvatars).toHaveBeenCalled();
        });

        it('should maintain subscription to takenAvatars$', () => {
            const initialLength = component.avatarList.length;
            const takenAvatarNames = [Object.values(AvatarEnum)[0].name, Object.values(AvatarEnum)[1].name];

            takenAvatarsSubject.next(takenAvatarNames);

            expect(component.takenAvatars).toEqual(takenAvatarNames);
            expect(component.avatarList.length).toBeLessThan(initialLength);
        });
    });
});
