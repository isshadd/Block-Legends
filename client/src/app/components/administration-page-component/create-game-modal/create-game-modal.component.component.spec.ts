import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { GameMode } from '@common/enums/game-mode';
import { MapSize } from '@common/enums/map-size';
import { CreateGameModalComponent } from './createGameModal.component';

describe('CreateGameModalComponent', () => {
    let component: CreateGameModalComponent;
    let fixture: ComponentFixture<CreateGameModalComponent>;
    let dialogRef: jasmine.SpyObj<MatDialogRef<CreateGameModalComponent>>;
    let router: jasmine.SpyObj<Router>;
    let gameMapDataManagerService: jasmine.SpyObj<GameMapDataManagerService>;

    beforeEach(async () => {
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const gameMapDataSpy = jasmine.createSpyObj('GameMapDataManagerService', ['setLocalStorageVariables']);

        await TestBed.configureTestingModule({
            imports: [CreateGameModalComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: Router, useValue: routerSpy },
                { provide: GameMapDataManagerService, useValue: gameMapDataSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateGameModalComponent);
        component = fixture.componentInstance;
        dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<CreateGameModalComponent>>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        gameMapDataManagerService = TestBed.inject(GameMapDataManagerService) as jasmine.SpyObj<GameMapDataManagerService>;

        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog when onNoClick is called', () => {
        component.onNoClick();
        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should set local storage variables and navigate to /map-editor on create click if size is selected', () => {
        component.selectedSize = MapSize.SMALL;
        component.selectedMode = GameMode.Classique;

        component.onCreateClick();

        expect(dialogRef.close).toHaveBeenCalled();
        expect(gameMapDataManagerService.setLocalStorageVariables).toHaveBeenCalledWith(true, {
            name: '',
            description: '',
            size: component.selectedSize,
            mode: component.selectedMode,
            imageUrl: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Vanilla-PMP_Collection-Carousel-0_Tricky-Trials_1280x768.jpg',
            isVisible: false,
            tiles: [],
        });
        expect(router.navigate).toHaveBeenCalledWith(['/map-editor']);
    });

    it('should update the selected size when selectSize is called', () => {
        component.selectSize(MapSize.MEDIUM);
        expect(component.selectedSize).toBe(MapSize.MEDIUM);
    });

    it('should update the selected mode when selectMode is called', () => {
        component.selectMode(GameMode.CTF);
        expect(component.selectedMode).toBe(GameMode.CTF);
    });
});
