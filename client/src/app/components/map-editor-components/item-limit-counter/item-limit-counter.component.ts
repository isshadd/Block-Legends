import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-item-limit-counter',
    standalone: true,
    imports: [],
    templateUrl: './item-limit-counter.component.html',
    styleUrl: './item-limit-counter.component.scss',
})
export class ItemLimitCounterComponent {
    @Input() currentCount: number;
}
