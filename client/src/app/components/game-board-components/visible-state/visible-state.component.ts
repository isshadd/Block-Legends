import { Component, Input } from '@angular/core';
export enum VisibleStateColor {
    HOVERED_COLOR = 'rgba(255, 255, 255, 0.3)',
    SELECTED_COLOR = 'rgba(255, 255, 0, 0.3)',
    VALID_COLOR = 'rgba(50, 255, 50, 0.3)',
    INVALID_COLOR = 'rgba(255, 50, 50, 0.3)',
    NOT_SELECTED_COLOR = 'rgba(255, 255, 255, 0)',
    DISABLED_COLOR = 'rgba(0, 0, 0, 0.5)',
}
import { PlaceableEntity, VisibleState } from '@common/placeable-entity';
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
                return VisibleStateColor.SELECTED_COLOR;
            case VisibleState.hovered:
                return VisibleStateColor.HOVERED_COLOR;
            case VisibleState.valid:
                return VisibleStateColor.VALID_COLOR;
            case VisibleState.invalid:
                return VisibleStateColor.INVALID_COLOR;
            case VisibleState.disabled:
                return VisibleStateColor.DISABLED_COLOR;
            default:
                return VisibleStateColor.NOT_SELECTED_COLOR;
        }
    }
}
