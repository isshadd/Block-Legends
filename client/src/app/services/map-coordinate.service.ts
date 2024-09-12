import { Injectable } from '@angular/core';
import { Vec2 } from '../interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class MapCoordinateService {
    coordinate: Vec2 = { x: -1, y: -1 };
}
