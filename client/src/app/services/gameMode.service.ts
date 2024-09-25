import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModeService {
  private selectedModeSubject = new BehaviorSubject<string>('Combat classique');
  selectedMode$ = this.selectedModeSubject.asObservable();

  setSelectedMode(mode: string): void {
    this.selectedModeSubject.next(mode);
  }
}