import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    private playerColors: { [key: string]: string } = {}; // Store generated colors for players
    private colors: string[] = ['#3a86ff', '#ff006e', '#8338ec', '#fb5607', '#ffbe0b', '#00b4d8']; // Predefined set of colors
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