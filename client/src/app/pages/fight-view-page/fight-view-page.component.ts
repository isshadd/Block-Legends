import { Component } from '@angular/core';
import { ModalOneOptionComponent } from '@app/components/modal-one-option/modal-one-option.component';
@Component({
    selector: 'app-fight-view-page',
    standalone: true,
    imports: [ModalOneOptionComponent],
    templateUrl: './fight-view-page.component.html',
    styleUrl: './fight-view-page.component.scss',
})
export class FightViewPageComponent {
    constructor() {}
}
