import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { GameService } from '@app/services/game-services/game.service';
import { WebSocketService } from '@app/services/SocketService/websocket.service';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { PlayerCreateCharacterComponent } from './player-create-character.component';

// Mock des composants enfants
@Component({
    selector: 'app-attributes',
    template: '',
})
class MockAttributesComponent {
    @Input() character: PlayerCharacter;
}

@Component({
    selector: 'app-avatar-selection',
    template: '',
})
class MockAvatarSelectionComponent {
    @Input() character: PlayerCharacter;
}

@Component({
    selector: 'app-character-form',
    template: '',
})
class MockCharacterFormComponent {
    @Input() character: PlayerCharacter;
}

@Component({
    selector: 'app-modal',
    template: '',
})
class MockModalComponent {
    @Input() isOpen: boolean = false;
    @Input() title: string = '';
    @Input() content: string = '';
}

describe('PlayerCreateCharacterComponent', () => {
    let component: PlayerCreateCharacterComponent;
    let fixture: ComponentFixture<PlayerCreateCharacterComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let mockSocket: jasmine.SpyObj<Socket>;

    const mockQueryParams = {
        queryParams: of({ roomId: '1234' }),
    };

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameService = jasmine.createSpyObj('GameService', ['setCharacter']);
        mockSocket = jasmine.createSpyObj('Socket', ['on']);
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['addPlayerToRoom'], {
            socket: mockSocket,
        });

        await TestBed.configureTestingModule({
            declarations: [MockAttributesComponent, MockAvatarSelectionComponent, MockCharacterFormComponent, MockModalComponent],
            imports: [PlayerCreateCharacterComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: GameService, useValue: mockGameService },
                { provide: WebSocketService, useValue: mockWebSocketService },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParams: mockQueryParams },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayerCreateCharacterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('PlayerCreateCharacterComponent', () => {
        let component: PlayerCreateCharacterComponent;
        let fixture: ComponentFixture<PlayerCreateCharacterComponent>;
        let mockRouter: jasmine.SpyObj<Router>;
        let mockGameService: jasmine.SpyObj<GameService>;
        let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
        let mockSocket: jasmine.SpyObj<Socket>;

        beforeEach(async () => {
            mockRouter = jasmine.createSpyObj('Router', ['navigate']);
            mockGameService = jasmine.createSpyObj('GameService', ['setCharacter']);
            mockSocket = jasmine.createSpyObj('Socket', ['on']);
            mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['addPlayerToRoom'], {
                socket: mockSocket,
            });

            await TestBed.configureTestingModule({
                declarations: [MockAttributesComponent, MockAvatarSelectionComponent, MockCharacterFormComponent, MockModalComponent],
                imports: [PlayerCreateCharacterComponent],
                providers: [
                    { provide: Router, useValue: mockRouter },
                    { provide: GameService, useValue: mockGameService },
                    { provide: WebSocketService, useValue: mockWebSocketService },
                    {
                        provide: ActivatedRoute,
                        useValue: { queryParams: of({ roomId: '1234' }) },
                    },
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(PlayerCreateCharacterComponent);
            component = fixture.componentInstance;
        });

        it('should create', () => {
            fixture.detectChanges();
            expect(component).toBeTruthy();
        });

        describe('createPlayerCharacter', () => {
            beforeEach(() => {
                // Réinitialiser les spies entre chaque test
                mockSocket.on.calls.reset();
                mockRouter.navigate.calls.reset();
                mockGameService.setCharacter.calls.reset();
                mockWebSocketService.addPlayerToRoom.calls.reset();

                fixture.detectChanges();
            });

            it('should update gameId from queryParams', fakeAsync(() => {
                component.createPlayerCharacter();
                tick();
                expect(component.gameId).toBe('1234');
            }));

            it('should handle multiple missing fields', () => {
                component.character = new PlayerCharacter('');
                component.character.isAttackBonusAssigned = false;
                component.character.isDefenseBonusAssigned = false;
                component.character.isLifeBonusAssigned = true;
                component.character.isSpeedBonusAssigned = true;

                component.createPlayerCharacter();

                expect(component.characterStatus).toContain('Nom');
                expect(component.characterStatus).toContain('Avatar');
                expect(component.characterStatus).toContain("Bonus d'attaque");
                expect(component.characterStatus).toContain('Bonus de défense');
            });

            it('should execute socket event handlers', fakeAsync(() => {
                // Configurer un personnage valide
                component.character = new PlayerCharacter('Test');
                component.character.avatar = AvatarEnum.Alex;
                component.character.isAttackBonusAssigned = true;
                component.character.isDefenseBonusAssigned = true;
                component.character.isLifeBonusAssigned = true;
                component.character.isSpeedBonusAssigned = true;
                component.character.isNameValid = true;

                // Simuler tous les événements socket dans l'ordre
                const socketOnCalls: { event: string; callback: Function }[] = [];
                mockSocket.on.and.callFake((event: string, callback: Function) => {
                    socketOnCalls.push({ event, callback });
                    return mockSocket;
                });

                component.createPlayerCharacter();
                tick();

                // Vérifier que tous les événements sont écoutés
                expect(mockSocket.on).toHaveBeenCalledWith('joinGameResponseNoMoreExisting', jasmine.any(Function));
                expect(mockSocket.on).toHaveBeenCalledWith('joinGameResponseLockedAfterJoin', jasmine.any(Function));
                expect(mockSocket.on).toHaveBeenCalledWith('joinGameResponseCanJoin', jasmine.any(Function));

                // Tester chaque callback
                const noMoreExistingCallback = socketOnCalls.find((call) => call.event === 'joinGameResponseNoMoreExisting')?.callback;
                const lockedAfterJoinCallback = socketOnCalls.find((call) => call.event === 'joinGameResponseLockedAfterJoin')?.callback;
                const canJoinCallback = socketOnCalls.find((call) => call.event === 'joinGameResponseCanJoin')?.callback;

                noMoreExistingCallback?.();
                expect(mockRouter.navigate).toHaveBeenCalledWith(['join-game']);

                lockedAfterJoinCallback?.();
                expect(mockRouter.navigate).toHaveBeenCalledWith(['join-game']);

                canJoinCallback?.({ valid: true });
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/waiting-view'], { queryParams: { roomId: '1234' } });

                canJoinCallback?.({ valid: false });
                expect(mockRouter.navigate).toHaveBeenCalledWith(['join-game']);

                // Vérifier que addPlayerToRoom est appelé avec les bons paramètres
                expect(mockWebSocketService.addPlayerToRoom).toHaveBeenCalledWith(1234, component.character);
            }));

            it('should handle default case in switch statement', () => {
                const testCharacter = new PlayerCharacter('Test');
                testCharacter.avatar = AvatarEnum.Alex;
                testCharacter.isAttackBonusAssigned = true;
                testCharacter.isDefenseBonusAssigned = true;
                testCharacter.isLifeBonusAssigned = true;
                testCharacter.isSpeedBonusAssigned = true;
                component.character = testCharacter;

                component.createPlayerCharacter();

                // Si tous les champs sont valides, on ne devrait pas avoir de message d'erreur
                expect(component.characterStatus).not.toContain('Manquants');
            });
        });

        describe('quitToHome', () => {
            it('should navigate to home page', () => {
                component.quitToHome();
                expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
            });
        });
    });
});
