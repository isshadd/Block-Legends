import { Component, Input } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';

@Component({
    selector: 'app-image-showcase',
    standalone: true,
    imports: [],
    templateUrl: './image-showcase.component.html',
    styleUrl: './image-showcase.component.scss',
})
export class ImageShowcaseComponent {
    @Input() character: PlayerCharacter;
}
