import { Component, Input } from '@angular/core';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
export enum VisibleStateColor {
    HoveredColor = 'rgba(255, 255, 255, 0.3)',
    SelectedColor = 'rgba(255, 255, 0, 0.3)',
    ValidColor = 'rgba(50, 255, 50, 0.3)',
    InvalidColor = 'rgba(255, 50, 50, 0.3)',
    NotSelectedColor = 'rgba(255, 255, 255, 0)',
    DisabledColor = 'rgba(0, 0, 0, 0.5)',
}
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
            case VisibleState.Selected:
                return VisibleStateColor.SelectedColor;
            case VisibleState.Hovered:
                return VisibleStateColor.HoveredColor;
            case VisibleState.Valid:
                return VisibleStateColor.ValidColor;
            case VisibleState.Invalid:
                return VisibleStateColor.InvalidColor;
            case VisibleState.Disabled:
                return VisibleStateColor.DisabledColor;
            default:
                return VisibleStateColor.NotSelectedColor;
        }
    }
}
