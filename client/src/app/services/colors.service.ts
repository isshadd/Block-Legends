import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    private playerColors: { [key: string]: string } = {}; // Store generated colors for players
    private colors: string[] = ['#006D77', '#4169E1', '#228B22', '#DC143C', '#5D3FD3', '#FFBF00']; // Predefined set of colors
    private nextColorIndex = 0; // Track the next color to assign

    getColor(socketId: string): string {
        if (!this.playerColors[socketId]) {
            this.playerColors[socketId] = this.assignColor();
        }
        return this.playerColors[socketId];
    }

    private assignColor(): string {
        const color = this.colors[this.nextColorIndex];
        this.nextColorIndex = (this.nextColorIndex + 1) % this.colors.length;
        return color;
    }
}
