import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager/play-game-board-manager.service';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { AvatarEnum } from '@common/enums/avatar-enum';
import { ItemType } from '@common/enums/item-type';
import { VisibleState } from '@common/interfaces/placeable-entity';
import { PlayersListComponent } from './players-list.component';

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;

    beforeEach(async () => {
        const playGameBoardManagerSpy = jasmine.createSpyObj('PlayGameBoardManagerService', [], {
            currentPlayerIdTurn: '12345',
        });

        await TestBed.configureTestingModule({
            imports: [PlayersListComponent],
            providers: [{ provide: PlayGameBoardManagerService, useValue: playGameBoardManagerSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayersListComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly handle players input', () => {
        const mockPlayers: PlayerCharacter[] = [new PlayerCharacter('Player 1'), new PlayerCharacter('Player 2')];
        mockPlayers[0].avatar = AvatarEnum.Alex;
        mockPlayers[1].avatar = AvatarEnum.Arlina;
        component.players = mockPlayers;
        fixture.detectChanges();

        expect(component.players).toBe(mockPlayers);
    });

    describe('isTurn', () => {
        it('should return true if the player ID matches the currentPlayerIdTurn', () => {
            const mockPlayer = new PlayerCharacter('Player 1');
            mockPlayer.socketId = '12345';

            expect(component.isTurn(mockPlayer)).toBeTrue();
        });

        it('should return false if the player ID does not match the currentPlayerIdTurn', () => {
            const mockPlayer = new PlayerCharacter('Player 2');
            mockPlayer.socketId = '67890';

            expect(component.isTurn(mockPlayer)).toBeFalse();
        });
    });

    describe('hasFlag', () => {
        it('should return true if the player has a flag in their inventory', () => {
            const mockPlayer = new PlayerCharacter('Player 1');
            mockPlayer.inventory = [
                {
                    type: ItemType.Flag,
                    description: '',
                    imageUrl: '',
                    coordinates: { x: 0, y: 0 },
                    visibleState: VisibleState.NotSelected,
                    isPlaced: false,
                    itemLimit: 0,
                    isItem(): boolean {
                        throw new Error('Function not implemented.');
                    },
                    setCoordinates(): void {
                        throw new Error('Function not implemented.');
                    },
                    isGrabbable(): boolean {
                        throw new Error('Function not implemented.');
                    },
                },
            ];

            expect(component.hasFlag(mockPlayer)).toBeTrue();
        });

        it('should return false if the player does not have a flag in their inventory', () => {
            const mockPlayer = new PlayerCharacter('Player 2');
            mockPlayer.inventory = [
                {
                    type: ItemType.Sword,
                    description: '',
                    imageUrl: '',
                    coordinates: { x: 0, y: 0 },
                    visibleState: VisibleState.NotSelected,
                    isPlaced: false,
                    itemLimit: 0,
                    isItem(): boolean {
                        throw new Error('Function not implemented.');
                    },
                    setCoordinates(): void {
                        throw new Error('Function not implemented.');
                    },
                    isGrabbable(): boolean {
                        throw new Error('Function not implemented.');
                    },
                },
            ];

            expect(component.hasFlag(mockPlayer)).toBeFalse();
        });
    });
});
