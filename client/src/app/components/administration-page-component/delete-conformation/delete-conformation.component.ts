import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-delete-confirmation',
    standalone: true,
    templateUrl: './delete-conformation.component.html',
    styleUrls: ['./delete-conformation.component.scss'],
})
export class DeleteConfirmationComponent {
    constructor(public dialogRef: MatDialogRef<DeleteConfirmationComponent>) {}

    closeConfirmation(): void {
        this.dialogRef.close();
    }
}
