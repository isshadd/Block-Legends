import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayersListComponent } from './players-list.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlayersListComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlayersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});