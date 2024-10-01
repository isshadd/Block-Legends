import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { ItemLimitCounterComponent } from '../item-limit-counter/item-limit-counter.component';
@Component({
    selector: 'app-placeable-entity-container',
    standalone: true,
    imports: [PlaceableEntityComponent, MatTooltipModule, VisibleStateComponent, DragDropModule, ItemLimitCounterComponent],
    templateUrl: './placeable-entity-container.component.html',
    styleUrl: './placeable-entity-container.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class PlaceableEntityContainerComponent {
    constructor(
        public mapEditorManagerService: MapEditorManagerService,
        public gameMapDataManagerService: GameMapDataManagerService,
    ) {}
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

    onDragStarted(entity: PlaceableEntity) {
        this.mapEditorManagerService.startDrag(entity);
    }

    onDragEnded() {
        this.mapEditorManagerService.endDrag();
    }
}
