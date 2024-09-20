import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink, RouterModule } from '@angular/router';
import { Game } from '@common/game.interface';
import { AdministrationGameComponent } from './administration-game.component';

describe('AdministrationGameComponent', () => {
    let component: AdministrationGameComponent;
    let fixture: ComponentFixture<AdministrationGameComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule, RouterLink, RouterModule.forRoot([]), AdministrationGameComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AdministrationGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should delete the game', () => {
        const game: Game = {
            id: 4,
            name: 'Test Gameclear',
            size: 30,
            mode: 'CTF',
            imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
        };
        component.games.push(game);
        expect(component.games).toContain(game);
        component.deleteGame(game);
        expect(component.games).not.toContain(game);
    });

    it('should change visibility of the game', () => {
        const game = {
            id: 4,
            name: 'Test Gameclear',
            size: 30,
            mode: 'CTF',
            imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
        };
        component.toggleVisibility(game);
        expect(game.isVisible).toBeFalse();
        game.isVisible = false;
        component.toggleVisibility(game);
        expect(game.isVisible).toBeTrue();
    });
});
