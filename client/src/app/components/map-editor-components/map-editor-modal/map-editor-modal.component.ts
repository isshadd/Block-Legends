import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MapShared } from '@common/interfaces/map-shared';

@Component({
    selector: 'app-map-editor-modal',
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
    templateUrl: './map-editor-modal.component.html',
    styleUrl: './map-editor-modal.component.scss',
})
export class MapEditorModalComponent {
    infoForm: FormGroup;
    readonly NAME_MAX_LENGTH: number = 50;
    readonly DESCRIPTION_MAX_LENGTH: number = 255;

    constructor(
        public dialogRef: MatDialogRef<MapEditorModalComponent>,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: MapShared,
    ) {
        this.infoForm = this.formBuilder.group({
            name: [data.name, [Validators.required, Validators.maxLength(this.NAME_MAX_LENGTH)]],
            description: [data.description, [Validators.required, Validators.maxLength(this.DESCRIPTION_MAX_LENGTH)]],
        });
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

    onSaveClick(): void {
        if (this.infoForm.valid) {
            this.dialogRef.close(this.infoForm.value);
        }
    }
}
