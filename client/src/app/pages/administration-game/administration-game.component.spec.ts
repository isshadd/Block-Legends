import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink, RouterModule } from '@angular/router';
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

    it('onMouseOver should set isHovered to true', () => {
        const game = { isHovered: false };
        component.onMouseOver(game);
        expect(game.isHovered).toBeTrue();
    });

    it('onMouseOut should set isHovered to false', () => {
        const game = { isHovered: true };
        component.onMouseOut(game);
        expect(game.isHovered).toBeFalse();
    });

    it('getImageStyles should return the correct styles', () => {
        const game = { isHovered: true, isVisible: true };
        const styles = component.getImageStyles(game);
        expect(styles.transform).toBe('scale(1.4)');
        expect(styles.opacity).toBe('1');
        expect(styles.transition).toBe('transform 0.3s ease, opacity 0.3s ease');
        const game1 = { isHovered: false, isVisible: false };
        const styles1 = component.getImageStyles(game1);
        expect(styles1.transform).toBe('scale(1)');
        expect(styles1.opacity).toBe('0.5');
        expect(styles1.transition).toBe('transform 0.3s ease, opacity 0.3s ease');
    });

    it('should delete the game', () => {
        const game = {
            name: 'Test Gameclear',
            size: 30,
            mode: 'CTF',
            imgSrc: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModif: new Date('2024-10-23'),
            isVisible: true,
        };
        component.games.push(game);
        component.deleteGame(game);
        expect(component.games).not.toContain(game);
    });

    it('should change visibility of the game', () => {
        const game = { isVisible: true };
        component.toggleVisibility(game);
        expect(game.isVisible).toBeFalse();
        const game1 = { isVisible: false };
        component.toggleVisibility(game1);
        expect(game1.isVisible).toBeTrue();
    });

    it('getGameStyle should return the correct styles', () => {
        const game = { isVisible: true };
        const styles = component.getGameStyle(game);
        expect(styles.opacity).toBe('1');
        const game1 = { isVisible: false };
        const styles1 = component.getGameStyle(game1);
        expect(styles1.opacity).toBe('0.5');
    });
});
