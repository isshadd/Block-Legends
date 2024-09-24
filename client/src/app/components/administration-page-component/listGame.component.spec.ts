import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { Game } from '@common/game.interface';
import { ListGameComponent } from './listGame.component';

describe('ListGameComponent', () => {
    let component: ListGameComponent;
    let administrationService: jasmine.SpyObj<AdministrationPageManagerService>;

    const mockGames: Game[] = [
        {
            id: 0,
            name: 'League Of Legends',
            size: 30,
            mode: 'CTF',
            imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
        },
        {
            id: 1,
            name: 'Minecraft',
            size: 38,
            mode: 'Normal',
            imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            lastModificationDate: new Date('2020-01-03'),
            isVisible: true,
        },
        {
            id: 2,
            name: 'Penguin Diner',
            size: 25,
            mode: 'Normal',
            imageUrl: 'https://tcf.admeen.org/game/4500/4373/400x246/penguin-diner.jpg',
            lastModificationDate: new Date('2005-12-12'),
            isVisible: true,
        },
        {
            id: 3,
            name: 'Super Mario',
            size: 36,
            mode: 'CTF',
            imageUrl: 'https://image.uniqlo.com/UQ/ST3/eu/imagesother/2020/ut/gaming/pc-ut-hero-mario-35.jpg',
            lastModificationDate: new Date('2010-06-01'),
            isVisible: true,
        },
    ];

    beforeEach(async () => {
        // Create a mock service
        const administrationServiceMock = jasmine.createSpyObj('AdministrationPageManagerService', ['deleteGame', 'toggleVisibility']);
        administrationServiceMock.games = mockGames;

        await TestBed.configureTestingModule({
            imports: [CommonModule, RouterModule.forRoot([]), ListGameComponent], // Only one configureTestingModule call
            providers: [{ provide: AdministrationPageManagerService, useValue: administrationServiceMock }],
        }).compileComponents();

        const fixture = TestBed.createComponent(ListGameComponent);
        component = fixture.componentInstance;
        administrationService = TestBed.inject(AdministrationPageManagerService) as jasmine.SpyObj<AdministrationPageManagerService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return games from the service', () => {
        const games = component.GetGames();
        expect(games).toEqual(mockGames);
    });

    it('should call deleteGame on the service when DeleteGame is called', () => {
        const gameToDelete = mockGames[0];
        component.DeleteGame(gameToDelete);
        expect(administrationService.deleteGame).toHaveBeenCalledWith(gameToDelete);
    });

    it('should call toggleVisibility on the service when ToggleVisibility is called', () => {
        const gameToToggle = mockGames[1];
        component.ToggleVisibity(gameToToggle);
        expect(administrationService.toggleVisibility).toHaveBeenCalledWith(gameToToggle);
    });
});
