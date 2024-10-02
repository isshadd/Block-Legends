import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
    standalone: true,
    selector: 'app-error-modal',
    templateUrl: './error-modal.component.html',
    imports: [MatDialogModule],
})
export class ErrorModalComponent {
    constructor(
        public dialogRef: MatDialogRef<ErrorModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string },
    ) {}

    close(): void {
        this.dialogRef.close();
    }
}
