// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ActivatedRoute } from '@angular/router';
// import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
// import { PlayPageComponent } from './play-page.component';

// describe('PlayPageComponent', () => {
//     let component: PlayPageComponent;
//     let fixture: ComponentFixture<PlayPageComponent>;
//     let playGameBoardManagerServiceSpy: jasmine.SpyObj<PlayGameBoardManagerService>;

//     beforeEach(async () => {
//         const playGameBoardManagerSpy = jasmine.createSpyObj('PlayGameBoardManagerService', ['getCurrentGrid']);

//         await TestBed.configureTestingModule({
//             imports: [PlayPageComponent],
//             providers: [
//                 { provide: PlayGameBoardManagerService, useValue: playGameBoardManagerSpy },
//                 { provide: ActivatedRoute, useValue: {} },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(PlayPageComponent);
//         component = fixture.componentInstance;
//         playGameBoardManagerServiceSpy = TestBed.inject(PlayGameBoardManagerService) as jasmine.SpyObj<PlayGameBoardManagerService>;
//     });

//     it('should create the PlayPageComponent', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should inject PlayGameBoardManagerService', () => {
//         expect(component.playGameBoardManagerService).toBe(playGameBoardManagerServiceSpy);
//     });
// });
