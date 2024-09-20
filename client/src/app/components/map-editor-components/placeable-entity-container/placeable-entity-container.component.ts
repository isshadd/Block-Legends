import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';

@Component({
    selector: 'app-placeable-entity-container',
    standalone: true,
    imports: [PlaceableEntityComponent, MatTooltipModule, VisibleStateComponent],
    templateUrl: './placeable-entity-container.component.html',
    styleUrl: './placeable-entity-container.component.scss',
})
export class PlaceableEntityContainerComponent {
    @Input() containerTitle: string;
    @Input() containerItems: PlaceableEntity[];
}
