import { Component, Input } from '@angular/core';

export enum ButtonNotificationState {
    WARNING = 'warning',
    ALERT = 'alert',
    SUCCESS = 'success',
    HIDDEN = 'hidden',
}

@Component({
    selector: 'app-button-notification',
    standalone: true,
    imports: [],
    templateUrl: './button-notification.component.html',
    styleUrl: './button-notification.component.scss',
})
export class ButtonNotificationComponent {
    @Input() state: ButtonNotificationState;
}
