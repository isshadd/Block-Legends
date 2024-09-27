import { TestBed } from '@angular/core/testing';
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
            expect(mode).toBe('Combat classique');
            done();
        });
    });

    it('should change the selected mode when setSelectedMode is called', (done) => {
        service.setSelectedMode('Combat classique');
        service.selectedMode$.subscribe((mode: string) => {
            expect(mode).toBe('Combat classique');
            done();
        });
    });

    it('should emit new mode values when setSelectedMode is called', (done) => {
        const newMode = 'CTF';
        service.selectedMode$.subscribe((mode: string) => {
            if (mode === newMode) {
                expect(mode).toBe(newMode);
                done();
            }
        });

        service.setSelectedMode(newMode);
    });
});
