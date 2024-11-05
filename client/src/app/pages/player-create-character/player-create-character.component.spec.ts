import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { AttributesComponent } from '@app/components/create-character/attributes/attributes.component';
import { AvatarSelectionComponent } from '@app/components/create-character/avatar-selection/avatar-selection.component';
import { CharacterFormComponent } from '@app/components/create-character/character-form/character-form.component';
import { ModalComponent } from '@app/components/modal/modal.component';
import { GameService } from '@app/services/game-services/game.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { Avatar } from '@common/enums/avatar-enum';
import { of, Subject } from 'rxjs';
import { PlayerCreateCharacterComponent } from './player-create-character.component';

describe('PlayerCreateCharacterComponent', () => {
    let component: PlayerCreateCharacterComponent;
    let fixture: ComponentFixture<PlayerCreateCharacterComponent>;
    let mockRouter: any;
    let mockGameService: any;
    let mockWebSocketService: any;
    let mockActivatedRoute: any;
    let mockSocket: any;
    let destroy$ = new Subject<void>();

    beforeEach(async () => {
        mockRouter = {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
        };

        mockGameService = {
            setCharacter: jasmine.createSpy('setCharacter'),
        };

        mockSocket = {
            on: jasmine.createSpy('on'),
            emit: jasmine.createSpy('emit'),
        };

        mockWebSocketService = {
            socket: mockSocket,
            addPlayerToRoom: jasmine.createSpy('addPlayerToRoom'),
            init: jasmine.createSpy('init'),
            joinGameResponseNoMoreExisting: jasmine.createSpy('joinGameResponseNoMoreExisting'),
            joinGameResponseLockedAfterJoin: jasmine.createSpy('joinGameResponseLockedAfterJoin'),
            joinGameResponseCanJoin: jasmine.createSpy('joinGameResponseCanJoin'),
        };

        mockActivatedRoute = {
            queryParams: of({ roomId: '1234' }),
        };

        await TestBed.configureTestingModule({
            imports: [
                FormsModule,
                CommonModule,
                AttributesComponent,
                AvatarSelectionComponent,
                CharacterFormComponent,
                ModalComponent,
                PlayerCreateCharacterComponent,
            ],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: GameService, useValue: mockGameService },
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerCreateCharacterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        destroy$.next();
        destroy$.complete();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize gameId from query params', () => {
        component.createPlayerCharacter();
        expect(component.gameId).toBe('1234');
    });

    it('should allow navigation to home', () => {
        component.quitToHome();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should create player character with valid fields', () => {
        component.character = new PlayerCharacter('Hero');
        component.character.avatar = { url: 'avatar.png' } as unknown as Avatar;
        component.character.isAttackBonusAssigned = true;
        component.character.isDefenseBonusAssigned = true;
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;
        component.character.isNameValid = true;

        component.createPlayerCharacter();

        expect(mockGameService.setCharacter).toHaveBeenCalledWith(component.character);
        expect(mockWebSocketService.addPlayerToRoom).toHaveBeenCalledWith(1234, component.character);
        expect(mockSocket.on).toHaveBeenCalledWith('joinGameResponseNoMoreExisting', jasmine.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('joinGameResponseLockedAfterJoin', jasmine.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('joinGameResponseCanJoin', jasmine.any(Function));
    });

    it('should show error message for missing fields', () => {
        component.character = new PlayerCharacter('');
        component.character.avatar = { url: '' } as unknown as Avatar;
        component.character.isAttackBonusAssigned = false;
        component.character.isDefenseBonusAssigned = false;
        component.character.isLifeBonusAssigned = false;
        component.character.isSpeedBonusAssigned = false;

        component.createPlayerCharacter();

        expect(component.characterStatus).toContain('Manquants');
        expect(mockGameService.setCharacter).not.toHaveBeenCalled();
        expect(mockWebSocketService.addPlayerToRoom).not.toHaveBeenCalled();
    });

    it('should show error message for invalid name', () => {
        component.character = new PlayerCharacter(''); // Assume empty name is invalid
        component.character.isNameValid = false;
        component.character.avatar = { url: 'avatar.png' } as unknown as Avatar;
        component.character.isAttackBonusAssigned = true;
        component.character.isDefenseBonusAssigned = true;
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;

        component.createPlayerCharacter();

        expect(component.characterStatus).toBe(`Le formulaire de création de personnage n'est pas valide ! Manquants: Nom.`);
        expect(mockGameService.setCharacter).not.toHaveBeenCalled();
        expect(mockWebSocketService.addPlayerToRoom).not.toHaveBeenCalled();
    });

    it('should handle socket events correctly when game can be joined', () => {
        component.gameId = '1234';
        component.character = new PlayerCharacter('Hero');
        component.character.avatar = { url: 'avatar.png' } as unknown as Avatar;
        component.character.isAttackBonusAssigned = true;
        component.character.isDefenseBonusAssigned = true;
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;
        component.character.isNameValid = true;

        component.createPlayerCharacter();

        // Simulate 'joinGameResponseCanJoin' event
        const joinGameResponseHandler = mockSocket.on.calls.argsFor(2)[1];
        joinGameResponseHandler({ valid: true });

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/waiting-view'], { queryParams: { roomId: '1234' } });
    });

    it('should handle socket events correctly when game cannot be joined', () => {
        component.gameId = '1234';
        component.character = new PlayerCharacter('Hero');
        component.character.avatar = { url: 'avatar.png' } as unknown as Avatar;
        component.character.isAttackBonusAssigned = true;
        component.character.isDefenseBonusAssigned = true;
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;
        component.character.isNameValid = true;

        component.createPlayerCharacter();

        // Simulate 'joinGameResponseCanJoin' event with invalid response
        const joinGameResponseHandler = mockSocket.on.calls.argsFor(2)[1];
        joinGameResponseHandler({ valid: false });

        expect(mockRouter.navigate).toHaveBeenCalledWith(['join-game']);
    });

    it('should handle socket events correctly when no more rooms exist', () => {
        component.gameId = '1234';
        component.character = new PlayerCharacter('Hero');
        component.character.avatar = { url: 'avatar.png' } as unknown as Avatar;
        component.character.isAttackBonusAssigned = true;
        component.character.isDefenseBonusAssigned = true;
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;
        component.character.isNameValid = true;

        component.createPlayerCharacter();

        // Simulate 'joinGameResponseNoMoreExisting' event
        const joinGameResponseNoMoreExistingHandler = mockSocket.on.calls.argsFor(0)[1];
        joinGameResponseNoMoreExistingHandler({ message: 'No more rooms' });

        expect(mockRouter.navigate).toHaveBeenCalledWith(['join-game']);
    });

    it('should handle socket events correctly when room is locked after join', () => {
        component.gameId = '1234';
        component.character = new PlayerCharacter('Hero');
        component.character.avatar = { url: 'avatar.png' } as unknown as Avatar;
        component.character.isAttackBonusAssigned = true;
        component.character.isDefenseBonusAssigned = true;
        component.character.isLifeBonusAssigned = true;
        component.character.isSpeedBonusAssigned = true;
        component.character.isNameValid = true;

        component.createPlayerCharacter();

        // Simulate 'joinGameResponseLockedAfterJoin' event
        const joinGameResponseLockedAfterJoinHandler = mockSocket.on.calls.argsFor(1)[1];
        joinGameResponseLockedAfterJoinHandler({ message: 'Room locked after join' });

        expect(mockRouter.navigate).toHaveBeenCalledWith(['join-game']);
    });
});
