import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AvatarService {
    takenAvatarsSubject = new BehaviorSubject<string[]>([]);
    takenAvatars$ = this.takenAvatarsSubject.asObservable();

    updateTakenAvatars(avatars: string[]) {
        this.takenAvatarsSubject.next(avatars);
    }
}
