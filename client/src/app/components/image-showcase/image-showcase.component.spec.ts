/* eslint-disable @typescript-eslint/naming-convention*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game-services/game.service';
import { Avatar } from '@common/enums/avatar-enum';
import { Subject } from 'rxjs';
import { ImageShowcaseComponent } from './image-showcase.component';

describe('ImageShowcaseComponent', () => {
    let component: ImageShowcaseComponent;
    let fixture: ComponentFixture<ImageShowcaseComponent>;
    let gameService: jasmine.SpyObj<GameService>;
    let signalAvatarSelectedSubject: Subject<Avatar>;

    const mockAvatar = {
        mineshaftImage: 'mock-mineshaft.jpg',
        standing: 'mock-standing.jpg',
        dog_petting: 'mock-dog-petting.jpg',
        lost: 'mock-lost.jpg',
        fight: 'mock-fight.jpg',
    } as Avatar;

    beforeEach(async () => {
        signalAvatarSelectedSubject = new Subject<Avatar>();
        gameService = jasmine.createSpyObj('GameService', [], {
            signalAvatarSelected$: signalAvatarSelectedSubject.asObservable(),
        });

        await TestBed.configureTestingModule({
            imports: [ImageShowcaseComponent],
            providers: [{ provide: GameService, useValue: gameService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ImageShowcaseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default wallpaper image', () => {
        expect(component.currentImage).toBe('assets/images/avatar/wallpaper.jpg');
    });

    it('should update currentImage when receiving avatar signal', () => {
        spyOn(component, 'getRandomisedImage').and.returnValue('mock-image.jpg');
        signalAvatarSelectedSubject.next(mockAvatar);
        expect(component.getRandomisedImage).toHaveBeenCalledWith(mockAvatar);
        expect(component.currentImage).toBe('mock-image.jpg');
    });

    describe('getRandomisedImage', () => {
        let randomSpy: jasmine.Spy;

        beforeEach(() => {
            randomSpy = spyOn(Math, 'random');
        });

        it('should return mineshaftImage when random is 0', () => {
            const returnValue = 0;
            randomSpy.and.returnValue(returnValue);
            expect(component.getRandomisedImage(mockAvatar)).toBe(mockAvatar.mineshaftImage);
        });

        it('should return standing image when random is 1', () => {
            const returnValue = 0.2;
            randomSpy.and.returnValue(returnValue);
            expect(component.getRandomisedImage(mockAvatar)).toBe(mockAvatar.standing);
        });

        it('should return dog_petting image when random is 2', () => {
            const returnValue = 0.4;
            randomSpy.and.returnValue(returnValue);
            expect(component.getRandomisedImage(mockAvatar)).toBe(mockAvatar.dog_petting);
        });

        it('should return lost image when random is 3', () => {
            const returnValue = 0.6;
            randomSpy.and.returnValue(returnValue);
            expect(component.getRandomisedImage(mockAvatar)).toBe(mockAvatar.lost);
        });

        it('should return fight image when random is 4', () => {
            const returnValue = 0.8;
            randomSpy.and.returnValue(returnValue);
            expect(component.getRandomisedImage(mockAvatar)).toBe(mockAvatar.fight);
        });

        it('should return standing image for invalid random value', () => {
            const returnValue = 0.99;
            randomSpy.and.returnValue(returnValue);
            expect(component.getRandomisedImage(mockAvatar)).toBe(mockAvatar.fight);
        });
    });

    describe('setupImage', () => {
        it('should update currentImage with result from getRandomisedImage', () => {
            const expectedImage = 'test-image.jpg';
            spyOn(component, 'getRandomisedImage').and.returnValue(expectedImage);
            component.setupImage(mockAvatar);
            expect(component.currentImage).toBe(expectedImage);
            expect(component.getRandomisedImage).toHaveBeenCalledWith(mockAvatar);
        });
    });
});
