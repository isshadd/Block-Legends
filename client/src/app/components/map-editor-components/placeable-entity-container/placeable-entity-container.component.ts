import { DragDropModule } from '@angular/cdk/drag-drop';
import { Component, HostListener, Input, ViewEncapsulation } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Item } from '@app/classes/Items/item';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { VisibleStateComponent } from '@app/components/game-board-components/visible-state/visible-state.component';
import { ItemLimitCounterComponent } from '@app/components/map-editor-components/item-limit-counter/item-limit-counter.component';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { MapEditorSideMenuService } from '@app/services/map-editor-services/map-editor-side-menu.service';
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

    isDragging: boolean = false;
    dragImage: string = '';
    mouseX = 0;
    mouseY = 0;

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

    onMouseDown(event: Event, entity: PlaceableEntity) {
        if (entity.isItem()) {
            this.isDragging = true;
            this.dragImage = entity.imageUrl;

            this.updatePosition(event);
        }

        event.preventDefault();

        this.sideMenuService.onSideMenuMouseDown(entity);
    }

    @HostListener('document:mouseup')
    onMouseUp() {
        this.isDragging = false;
    }

    @HostListener('document:mousemove', ['$event'])
    updatePosition(event: Event) {
        if (this.isDragging) {
            this.mouseX = (event as MouseEvent).clientX;
            this.mouseY = (event as MouseEvent).clientY;
        }
    }

    getItemLimit(entity: PlaceableEntity): number {
        if (entity.isItem()) {
            return (entity as Item).itemLimit;
        }
        return 0;
    }
}
