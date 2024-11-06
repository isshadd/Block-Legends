// /* eslint-disable  @typescript-eslint/no-explicit-any */

// import { CommonModule } from '@angular/common';
// import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { GameService } from '@app/services/game-services/game.service';
// import { WebSocketService } from '@app/services/SocketService/websocket.service';
// import { AvatarEnum } from '@common/enums/avatar-enum';
// import { of } from 'rxjs';
// import { PlayerCreateCharacterComponent } from './player-create-character.component';

// const ACCESS_CODE = 1234;

// describe('PlayerCreateCharacterComponent', () => {
//     let component: PlayerCreateCharacterComponent;
//     let fixture: ComponentFixture<PlayerCreateCharacterComponent>;
//     let routerSpy: jasmine.SpyObj<Router>;
//     let gameServiceSpy: jasmine.SpyObj<GameService>;
//     let activatedRouteStub: Partial<ActivatedRoute>;
//     let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;

//     beforeEach(async () => {
//         routerSpy = jasmine.createSpyObj('Router', ['navigate']);
//         gameServiceSpy = jasmine.createSpyObj('GameService', ['setCharacter']);
//         webSocketServiceSpy = jasmine.createSpyObj('WebSocketService', ['addPlayerToRoom'], {
//             socket: jasmine.createSpyObj('Socket', ['on']),
//         });

//         activatedRouteStub = {
//             queryParams: of({ roomId: '1234' }),
//         };

//         await TestBed.configureTestingModule({
//             imports: [PlayerCreateCharacterComponent, FormsModule, CommonModule],
//             providers: [
//                 { provide: Router, useValue: routerSpy },
//                 { provide: GameService, useValue: gameServiceSpy },
//                 { provide: ActivatedRoute, useValue: activatedRouteStub },
//                 { provide: WebSocketService, useValue: webSocketServiceSpy },
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(PlayerCreateCharacterComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create the component', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should navigate to home when quitToHome is called', () => {
//         component.quitToHome();
//         expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
//     });

//     it('should set characterStatus when there are missing fields', () => {
//         // Set character fields to missing values
//         component.character.name = '';
//         component.character.isAttackBonusAssigned = false;
//         component.character.isDefenseBonusAssigned = false;
//         component.character.isLifeBonusAssigned = false;
//         component.character.isSpeedBonusAssigned = false;

//         component.createPlayerCharacter();

//         expect(component.characterStatus).toContain("Le formulaire de création de personnage n'est pas valide ! Manquants:");
//     });

//     it('should set characterStatus when character name is invalid', () => {
//         // Assign all required fields except for a valid name
//         component.character.name = ''; // Invalid name
//         component.character.avatar = AvatarEnum.Alex;
//         component.character.isAttackBonusAssigned = true;
//         component.character.isDefenseBonusAssigned = true;
//         component.character.isLifeBonusAssigned = true;
//         component.character.isSpeedBonusAssigned = true;

//         component.createPlayerCharacter();

//         expect(component.characterStatus).toBe('Le nom du personnage est invalide !');
//     });

//     it('should proceed to add player to room when all fields are valid', fakeAsync(() => {
//         // Assign valid values to all required fields
//         component.character.name = 'ValidName';
//         component.character.avatar = AvatarEnum.Alex;
//         component.character.isAttackBonusAssigned = true;
//         component.character.isDefenseBonusAssigned = true;
//         component.character.isLifeBonusAssigned = true;
//         component.character.isSpeedBonusAssigned = true;

//         // Mock the queryParams observable
//         activatedRouteStub.queryParams = of({ roomId: '1234' });

//         // Spy on socket.on method
//         spyOn(webSocketServiceSpy.socket, 'on').and.callFake((event: string, callback: (data?: any) => void) => {
//             if (event === 'joinGameResponseCanJoin') {
//                 callback();
//             }
//             return webSocketServiceSpy.socket;
//         });

//         component.createPlayerCharacter();
//         tick();

//         expect(gameServiceSpy.setCharacter).toHaveBeenCalledWith(component.character);
//         expect(webSocketServiceSpy.socket.on).toHaveBeenCalled();
//         expect(webSocketServiceSpy.addPlayerToRoom).toHaveBeenCalledWith(ACCESS_CODE, component.character);
//         expect(routerSpy.navigate).toHaveBeenCalledWith(['/waiting-view'], {
//             queryParams: { roomId: '1234' },
//         });
//     }));

//     it('should navigate to join-game on joinGameResponseNoMoreExisting event', fakeAsync(() => {
//         component.character.name = 'ValidName';
//         component.character.avatar = AvatarEnum.Alex;
//         component.character.isAttackBonusAssigned = true;
//         component.character.isDefenseBonusAssigned = true;
//         component.character.isLifeBonusAssigned = true;
//         component.character.isSpeedBonusAssigned = true;

//         // Mock the queryParams observable
//         activatedRouteStub.queryParams = of({ roomId: '1234' });

//         // Spy on socket.on method
//         spyOn(webSocketServiceSpy.socket, 'on').and.callFake((event: string, callback: (data?: any) => void) => {
//             if (event === 'joinGameResponseNoMoreExisting') {
//                 callback();
//             }
//             return webSocketServiceSpy.socket;
//         });

//         component.createPlayerCharacter();
//         tick();

//         expect(routerSpy.navigate).toHaveBeenCalledWith(['join-game']);
//     }));

//     it('should navigate to join-game on joinGameResponseLockedAfterJoin event', fakeAsync(() => {
//         component.character.name = 'ValidName';
//         component.character.avatar = AvatarEnum.Alex;
//         component.character.isAttackBonusAssigned = true;
//         component.character.isDefenseBonusAssigned = true;
//         component.character.isLifeBonusAssigned = true;
//         component.character.isSpeedBonusAssigned = true;

//         // Mock the queryParams observable
//         activatedRouteStub.queryParams = of({ roomId: '1234' });

//         // Spy on socket.on method
//         spyOn(webSocketServiceSpy.socket, 'on').and.callFake((event: string, callback: (data?: any) => void) => {
//             if (event === 'joinGameResponseLockedAfterJoin') {
//                 callback();
//             }
//             return webSocketServiceSpy.socket;
//         });

//         component.createPlayerCharacter();
//         tick();

//         expect(routerSpy.navigate).toHaveBeenCalledWith(['join-game']);
//     }));

//     it('should navigate to join-game when joinGameResponseCanJoin is invalid', fakeAsync(() => {
//         component.character.name = 'ValidName';
//         component.character.avatar = AvatarEnum.Alex;
//         component.character.isAttackBonusAssigned = true;
//         component.character.isDefenseBonusAssigned = true;
//         component.character.isLifeBonusAssigned = true;
//         component.character.isSpeedBonusAssigned = true;

//         // Mock the queryParams observable
//         activatedRouteStub.queryParams = of({ roomId: '1234' });

//         // Spy on socket.on method
//         spyOn(webSocketServiceSpy.socket, 'on').and.callFake((event: string, callback: (data?: any) => void) => {
//             if (event === 'joinGameResponseCanJoin') {
//                 callback();
//             }
//             return webSocketServiceSpy.socket;
//         });

//         component.createPlayerCharacter();
//         tick();

//         expect(routerSpy.navigate).toHaveBeenCalledWith(['join-game']);
//     }));
// });
