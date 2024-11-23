import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapSize } from '@common/enums/map-size';
import { InfosGameComponent } from './infos-game.component';

describe('InfosGameComponent', () => {
    let component: InfosGameComponent;
    let fixture: ComponentFixture<InfosGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InfosGameComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfosGameComponent);
        component = fixture.componentInstance;
        component.gameSize = MapSize.SMALL;
        component.nbrPlayers = 2;
        component.currentPlayer = 'Player1';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have gameSize input', () => {
        const gameSize = MapSize.SMALL;
        component.gameSize = gameSize;
        fixture.detectChanges();
        expect(component.gameSize).toBe(gameSize);
    });

    it('should have nbrPlayers input', () => {
        const nbrPlayers = 2;
        component.nbrPlayers = nbrPlayers;
        fixture.detectChanges();
        expect(component.nbrPlayers).toBe(nbrPlayers);
    });

    it('should have currentPlayer input', () => {
        const currentPlayer = 'Player1';
        component.currentPlayer = currentPlayer;
        fixture.detectChanges();
        expect(component.currentPlayer).toBe(currentPlayer);
    });
});
