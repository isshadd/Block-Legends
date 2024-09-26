import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ModeService {
    selectedMode$: Observable<string>;
    private selectedModeSubject = new BehaviorSubject<string>('Combat classique');
    constructor() {
        this.selectedMode$ = this.selectedModeSubject.asObservable();
    }

    setSelectedMode(mode: string): void {
        this.selectedModeSubject.next(mode);
    }
}
