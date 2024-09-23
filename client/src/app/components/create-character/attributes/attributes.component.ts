import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-attributes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './attributes.component.html',
    styleUrl: './attributes.component.scss',
})
export class AttributesComponent {
    @Input() character : PlayerCharacter;

    characterStatus: string | null;
}
