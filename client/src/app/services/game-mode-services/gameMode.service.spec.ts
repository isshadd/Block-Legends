import { TestBed } from '@angular/core/testing';
import { GameMode } from '@common/enums/game-mode';
import { ModeService } from './gameMode.service';

describe('ModeService', () => {
    let service: ModeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ModeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have default selected mode as "Combat classique"', (done) => {
        service.selectedMode$.subscribe((mode: string) => {
            expect(mode).toBe(GameMode.Classique);
            done();
        });
    });

    it('should change the selected mode when setSelectedMode is called', (done) => {
        service.setSelectedMode(GameMode.CTF);
        service.selectedMode$.subscribe((mode: string) => {
            expect(mode).toBe(GameMode.CTF);
            done();
        });
    });

    it('should emit new mode values when setSelectedMode is called', (done) => {
        const newMode = GameMode.CTF;
        service.selectedMode$.subscribe((mode: string) => {
            if (mode === newMode) {
                expect(mode).toBe(newMode);
                done();
            }
        });

        service.setSelectedMode(newMode);
    });
});
