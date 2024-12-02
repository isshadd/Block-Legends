import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    private playerColors: { [key: string]: string } = {}; // Store generated colors for players
    private colors: string[] = ['#3a86ff', '#ff006e', '#8338ec', '#fb5607', '#ffbe0b', '#00b4d8']; // Predefined set of colors

    getColor(socketId: string): string {
        if (!this.playerColors[socketId]) {
            this.playerColors[socketId] = this.assignColor(socketId);
        }
        return this.playerColors[socketId];
    }

    private assignColor(socketId: string): string {
        const index = Object.keys(this.playerColors).length % this.colors.length;
        return this.colors[index];
    }
}