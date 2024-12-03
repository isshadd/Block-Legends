import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-timer',
    standalone: true,
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    @Input() playerTurnName: string = '';
    @Input() seconds: number = 0;
    @Input() isBattle: boolean = false;

    formatTime(): string {
        return this.isBattle ? 'Combat en cours' : `${this.playerTurnName} ${this.seconds}`;
    }
}
