import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';

@Component({
    selector: 'app-map-editor-modal',
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
    templateUrl: './map-editor-modal.component.html',
    styleUrl: './map-editor-modal.component.scss',
})
export class MapEditorModalComponent {
    infoForm: FormGroup;
    readonly nameMaxLength: number = 50;
    readonly descriptionMaxLenght: number = 255;

    constructor(
        public dialogRef: MatDialogRef<MapEditorModalComponent>,
        private formBuilder: FormBuilder,
        public gameMapDataManagerService: GameMapDataManagerService,
        @Inject(MAT_DIALOG_DATA) public data: { name: string; description: string },
    ) {
        this.infoForm = this.formBuilder.group({
            name: [data.name, [Validators.required, Validators.maxLength(this.nameMaxLength)]],
            description: [data.description, [Validators.required, Validators.maxLength(this.descriptionMaxLenght)]],
        });
    }

    onCloseClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        if (this.infoForm.valid) {
            this.dialogRef.close(this.infoForm.value);
        }
    }

    onSaveClick(): void {
        this.gameMapDataManagerService.saveGame();
        this.dialogRef.close(this.infoForm.value);
    }
}
