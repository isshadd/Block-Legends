import { Component, Input } from '@angular/core';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';

const HOVERED_COLOR = 'rgba(255, 255, 255, 0.3)';
const SELECTED_COLOR = 'rgba(255, 255, 0, 0.3)';
const VALID_COLOR = 'rgba(50, 255, 50, 0.3)';
const INVALID_COLOR = 'rgba(255, 50, 50, 0.3)';
const NOT_SELECTED_COLOR = 'rgba(255, 255, 255, 0)';

@Component({
    selector: 'app-visible-state',
    standalone: true,
    imports: [],
    templateUrl: './visible-state.component.html',
    styleUrl: './visible-state.component.scss',
})
export class VisibleStateComponent {
    @Input() placeableEntity: PlaceableEntity;

    colorSelector() {
        switch (this.placeableEntity.visibleState) {
            case VisibleState.selected:
                return SELECTED_COLOR;
            case VisibleState.hovered:
                return HOVERED_COLOR;
            case VisibleState.valid:
                return VALID_COLOR;
            case VisibleState.invalid:
                return INVALID_COLOR;
            default:
                return NOT_SELECTED_COLOR;
        }
    }
}
