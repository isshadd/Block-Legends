import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
    selector: 'app-timer',
    standalone: true,
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
    @Input() seconds: number = 120;
    @Input() isBattle: boolean = false;
    intervalId: any;

    ngOnInit(): void {
        this.startTimer();
    }

    startTimer(): void {
        this.intervalId = setInterval(() => {
            this.seconds--;
        }, 1000); // Increment the seconds every 1000 milliseconds
    }

    ngOnDestroy(): void {
        clearInterval(this.intervalId); // Clear the interval on component destroy
    }

    formatTime(): string {
        if (this.isBattle) {
            const minutes = Math.floor(this.seconds / 60);
            const remainingSeconds = this.seconds % 60;
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`; // Format as mm:ss
        } else {
            return '-- : --';
        }
    }
}
