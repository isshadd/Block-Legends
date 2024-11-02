import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-timer',
    standalone: true,
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
    @Input() seconds: number = 0;
    @Input() isBattle: boolean = false;

    formatTime(): string {
        if (this.isBattle) {
            return 'Combat en cours';
        }
        return this.seconds.toString();
    }
}
