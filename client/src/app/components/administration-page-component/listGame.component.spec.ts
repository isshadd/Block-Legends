import { TestBed } from '@angular/core/testing';
import { AdministrationPageManagerService } from '@app/services/administration-page-services/administration-page-manager.services';
import { Game } from '@common/game.interface';
import { ListGameComponent } from './listGame.component';

describe('ListGameComponent', () => {
    let component: ListGameComponent;
    let administrationService: jasmine.SpyObj<AdministrationPageManagerService>;
    let mockGame: Game;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('AdministrationPageManagerService', ['deleteGame', 'toggleVisibility'], { games: [] });

        TestBed.configureTestingModule({
            imports: [ListGameComponent],
            providers: [{ provide: AdministrationPageManagerService, useValue: spy }],
        }).compileComponents();

        administrationService = TestBed.inject(AdministrationPageManagerService) as jasmine.SpyObj<AdministrationPageManagerService>;

        const fixture = TestBed.createComponent(ListGameComponent);
        component = fixture.componentInstance;

        mockGame = {
            name: 'League Of Legends',
            size: 30,
            mode: 'CTF',
            imageUrl: 'https://i.pinimg.com/originals/e6/3a/b7/e63ab723f3bd980125e1e5ab7d8c5081.png',
            lastModificationDate: new Date('2024-10-23'),
            isVisible: true,
            description: 'none',
        };
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should get the games from the service', () => {
        expect(component.getGames()).toEqual(administrationService.games);
    });

    it('should call deleteGame on the service when DeleteGame is called', () => {
        component.deleteGame(mockGame);
        expect(administrationService.deleteGame).toHaveBeenCalled();
        expect(administrationService.deleteGame).toHaveBeenCalledWith(mockGame);
    });

    it('should call toggleVisibility on the service when ToggleVisibility is called', () => {
        component.toggleVisibility(mockGame);
        expect(administrationService.toggleVisibility).toHaveBeenCalledWith(mockGame);
    });
});
