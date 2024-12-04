import { TestBed } from '@angular/core/testing';
import { AvatarService } from '@app/services/avatar-service/avatar.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { Avatar, AvatarEnum } from '@common/enums/avatar-enum';
import { ProfileEnum } from '@common/enums/profile';
import { BehaviorSubject } from 'rxjs';
import { GameService } from './game.service';

const ACCESS = 12345;

describe('GameService', () => {
    let service: GameService;
    let avatarServiceSpy: jasmine.SpyObj<AvatarService>;

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

    beforeEach(() => {
        avatarServiceSpy = jasmine.createSpyObj('AvatarService', [], {
            takenAvatars$: new BehaviorSubject<string[]>([]),
        });

        TestBed.configureTestingModule({
            providers: [GameService, { provide: AvatarService, useValue: avatarServiceSpy }],
        });

        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Basic Observable Management', () => {
        it('should initialize with default values', () => {
            service.accessCode$.subscribe((code) => {
                expect(code).toBeNull();
            });

            service.character$.subscribe((character) => {
                expect(character).toBeTruthy();
                expect(character?.name).toBe('');
            });
        });

        it('should set access code', () => {
            service.setAccessCode(ACCESS);

            service.accessCode$.subscribe((code) => {
                expect(code).toBe(ACCESS);
            });
        });

        it('should set character', () => {
            const testCharacter = new PlayerCharacter('TestPlayer');
            service.setCharacter(testCharacter);

            service.character$.subscribe((character) => {
                expect(character).toBe(testCharacter);
            });
        });

        it('should update player name', () => {
            const newName = 'UpdatedName';
            service.updatePlayerName(newName);

            service.character$.subscribe((character) => {
                expect(character?.name).toBe(newName);
            });
        });

        it('should set current player', () => {
            const testPlayer = new PlayerCharacter('TestPlayer');
            service.setCurrentPlayer(testPlayer);

            service.currentPlayer$.subscribe((player) => {
                expect(player).toBe(testPlayer);
            });
        });
    });

    describe('Virtual Character Generation', () => {
        it('should generate virtual character with all required avatar properties', () => {
            const virtualPlayer = service.generateVirtualCharacter(0, ProfileEnum.Agressive);

            expect(virtualPlayer.avatar).toBeTruthy();
            expect(virtualPlayer.avatar.name).toBeTruthy();
            expect(virtualPlayer.avatar.headImage).toBeTruthy();
            expect(virtualPlayer.avatar.fullImage).toBeTruthy();
            expect(virtualPlayer.avatar.mineshaftImage).toBeTruthy();
            expect(virtualPlayer.avatar.standing).toBeTruthy();
            expect(virtualPlayer.avatar.dogPetting).toBeTruthy();
            expect(virtualPlayer.avatar.lost).toBeTruthy();
            expect(virtualPlayer.avatar.fight).toBeTruthy();
        });

        it('should generate virtual character with aggressive profile', () => {
            const virtualPlayer = service.generateVirtualCharacter(0, ProfileEnum.Agressive);

            expect(virtualPlayer.isVirtual).toBeTrue();
            expect(virtualPlayer.comportement).toBe(ProfileEnum.Agressive);
            expect(virtualPlayer.socketId).toBeTruthy();
        });

        it('should generate virtual character with defensive profile', () => {
            const virtualPlayer = service.generateVirtualCharacter(0, ProfileEnum.Defensive);

            expect(virtualPlayer.isVirtual).toBeTrue();
            expect(virtualPlayer.comportement).toBe(ProfileEnum.Defensive);
            expect(virtualPlayer.socketId).toBeTruthy();
        });

        it('should assign random dice bonus to virtual character', () => {
            const virtualPlayer = service.generateVirtualCharacter(0, ProfileEnum.Agressive);

            expect(virtualPlayer.isAttackBonusAssigned || virtualPlayer.isDefenseBonusAssigned).toBeTrue();
            expect(virtualPlayer.isAttackBonusAssigned && virtualPlayer.isDefenseBonusAssigned).toBeTrue();
        });

        it('should assign random attribute bonus to virtual character', () => {
            const virtualPlayer = service.generateVirtualCharacter(0, ProfileEnum.Agressive);

            expect(virtualPlayer.isLifeBonusAssigned || virtualPlayer.isSpeedBonusAssigned).toBeTrue();
            expect(virtualPlayer.isLifeBonusAssigned && virtualPlayer.isSpeedBonusAssigned).toBeTrue();
        });

        it('should avoid taken avatars when generating virtual character', () => {
            const takenAvatarName = Object.values(AvatarEnum)[0].name;
            (avatarServiceSpy.takenAvatars$ as BehaviorSubject<string[]>).next([takenAvatarName]);

            const virtualPlayer = service.generateVirtualCharacter(0, ProfileEnum.Agressive);

            expect(virtualPlayer.avatar.name).not.toBe(takenAvatarName);
        });
    });

    describe('Name Management', () => {
        it('should release virtual player name', () => {
            const testName = 'TestName';
            (service as GameService).usedNames.add(testName);

            service.releaseVirtualPlayerName(testName);

            expect((service as GameService).usedNames.has(testName)).toBeFalse();
        });

        it('should handle releasing non-existent name', () => {
            const testName = 'NonExistentName';
            service.releaseVirtualPlayerName(testName);
            expect((service as GameService).usedNames.has(testName)).toBeFalse();
        });
    });

    describe('Game Management', () => {
        it('should clear game state', () => {
            const testCharacter = new PlayerCharacter('TestPlayer');
            service.setCharacter(testCharacter);
            service.setAccessCode(ACCESS);
            (service as GameService).usedNames.add('TestName');

            service.clearGame();

            service.accessCode$.subscribe((code) => {
                expect(code).toBeNull();
            });
            service.character$.subscribe((character) => {
                expect(character).toBeNull();
            });
            expect((service as GameService).usedNames.size).toBe(0);
        });

        it('should set selected avatar', (done) => {
            service.signalAvatarSelected$.subscribe((avatar) => {
                expect(avatar).toEqual(mockAvatar);
                done();
            });

            service.setSelectedAvatar(mockAvatar);
        });
    });

    it('should set the current player correctly', (done: DoneFn) => {
        const player = new PlayerCharacter('Hero');
        service.setCurrentPlayer(player);
        service.currentPlayer$.subscribe((currentPlayer) => {
            expect(currentPlayer).toBe(player);
            done();
        });
    });

    it('should assign bonus to attack or defense randomly', () => {
        const player1 = service.generateVirtualCharacter(1, ProfileEnum.Agressive);

        player1.assignAttackDice();
        player1.assignLifeBonus();
        player1.assignSpeedBonus();
        player1.assignDefenseDice();
    });

    it('should release virtual players names correctly', () => {
        const player1 = service.generateVirtualCharacter(1, ProfileEnum.Agressive);
        const player2 = service.generateVirtualCharacter(2, ProfileEnum.Defensive);

        service.usedNames.add(player1.name);
        service.usedNames.add(player2.name);

        spyOn(service.usedNames, 'delete').and.callThrough();

        service.releaseVirtualPlayerName(player1.name);

        expect(service.usedNames.delete).toHaveBeenCalled();
        expect(service.usedNames.has(player1.name)).toBeFalse();
    });
});
