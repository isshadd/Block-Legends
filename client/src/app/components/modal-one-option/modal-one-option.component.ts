import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-modal-one-option',
    standalone: true,
    imports: [],
    templateUrl: './modal-one-option.component.html',
    styleUrl: './modal-one-option.component.scss',
})
export class ModalOneOptionComponent {
    @Input() title: string = '';
    @Input() message: string = '';
    @Input() confirmText: string = 'Fermer';

    @Output() confirm = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }
}
