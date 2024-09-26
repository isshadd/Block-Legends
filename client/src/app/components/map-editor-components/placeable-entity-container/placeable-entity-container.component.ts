import { Component, Input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';

@Component({
    selector: 'app-placeable-entity-container',
    standalone: true,
    imports: [PlaceableEntityComponent, MatTooltipModule, VisibleStateComponent],
    templateUrl: './placeable-entity-container.component.html',
    styleUrl: './placeable-entity-container.component.scss',
})
export class PlaceableEntityContainerComponent {
    constructor(public mapEditorManagerService: MapEditorManagerService) {}
    @Input() containerTitle: string;
    @Input() containerItems: PlaceableEntity[];

    onMouseEnter(entity: PlaceableEntity) {
        this.mapEditorManagerService.onMouseEnter(entity);
    }

    onMouseLeave(entity: PlaceableEntity) {
        this.mapEditorManagerService.onMouseLeave(entity);
    }

    onMouseDown(entity: PlaceableEntity) {
        this.mapEditorManagerService.onMouseDownSideMenu(entity);
    }
}
