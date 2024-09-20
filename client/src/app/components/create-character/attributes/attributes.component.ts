import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlayerAttributes } from '@app/classes/Characters/player-attributes';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-attributes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './attributes.component.html',
    styleUrl: './attributes.component.scss',
})
export class AttributesComponent {
    character = new PlayerCharacter('', '', new PlayerAttributes());

    characterStatus: string | null;
}
