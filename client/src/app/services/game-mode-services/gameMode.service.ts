import { Injectable } from '@angular/core';
import { GameMode } from '@common/enums/game-mode';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ModeService {
    selectedMode$: Observable<GameMode>;
    private selectedModeSubject = new BehaviorSubject<GameMode>(GameMode.Classique);
    constructor() {
        this.selectedMode$ = this.selectedModeSubject.asObservable();
    }

    setSelectedMode(mode: GameMode): void {
        this.selectedModeSubject.next(mode);
    }

    getSelectedMode(): GameMode {
        return this.selectedModeSubject.getValue();
    }
}
