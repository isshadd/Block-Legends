import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';
import { ItemLimitCounterComponent } from '@app/components/map-editor-components/item-limit-counter/item-limit-counter.component';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager/game-map-data-manager.service';
import { MapEditorSideMenuService } from '@app/services/map-editor-services/map-editor-side-menu.service';
import { Item } from '@common/classes/Items/item';
import { PlaceableEntity } from '@common/interfaces/placeable-entity';
@Component({
    selector: 'app-placeable-entity-container',
    standalone: true,
    imports: [PlaceableEntityComponent, MatTooltipModule, VisibleStateComponent, DragDropModule, ItemLimitCounterComponent],
    templateUrl: './placeable-entity-container.component.html',
    styleUrl: './placeable-entity-container.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class PlaceableEntityContainerComponent {
    @Input() containerTitle: string;
    @Input() containerItems: PlaceableEntity[];

    constructor(
        public gameMapDataManagerService: GameMapDataManagerService,
        public sideMenuService: MapEditorSideMenuService,
    ) {}

    onMouseEnter(entity: PlaceableEntity) {
        this.sideMenuService.onSideMenuMouseEnter(entity);
    }

    onMouseLeave(entity: PlaceableEntity) {
        this.sideMenuService.onSideMenuMouseLeave(entity);
    }

    onMouseDown(event: MouseEvent, entity: PlaceableEntity) {
        if (event.button === 2) return;

        this.sideMenuService.onSideMenuMouseDown(entity);
        event.preventDefault();
    }

    getItemLimit(entity: PlaceableEntity): number {
        return entity.isItem() ? (entity as Item).itemLimit : 0;
    }
}
