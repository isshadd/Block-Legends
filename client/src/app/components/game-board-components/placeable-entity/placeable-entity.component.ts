import { Component, Input } from '@angular/core';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';

@Component({
    selector: 'app-placeable-entity',
    standalone: true,
    imports: [],
    templateUrl: './placeable-entity.component.html',
    styleUrl: './placeable-entity.component.scss',
})
export class PlaceableEntityComponent {
    @Input() placeableEntity: PlaceableEntity;
}
5