import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DebugService {
    isDebugMode: boolean = false;
    isPlayerMoving: boolean = false;
}
