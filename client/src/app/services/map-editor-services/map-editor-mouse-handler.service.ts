import { Injectable } from '@angular/core';
import { Item } from '@app/classes/Items/item';
import { DoorTile } from '@app/classes/Tiles/door-tile';
import { GrassTile } from '@app/classes/Tiles/grass-tile';
import { OpenDoor } from '@app/classes/Tiles/open-door';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { Subject } from 'rxjs';

enum MouseButton {
    Left = 0,
    Right = 2,
}

@Injectable({
    providedIn: 'root',
})
export class MapEditorMouseHandlerService {
    private signalTileCopy = new Subject<{ tile: Tile; entity: Tile }>();
    signalTileCopy$ = this.signalTileCopy.asObservable();

    private signalItemPlacer = new Subject<{ item: Item; entity: Tile }>();
    signalItemPlacer$ = this.signalItemPlacer.asObservable();

    private signalItemRemover = new Subject<Tile>();
    signalItemRemover$ = this.signalItemRemover.asObservable();

    private signalCancelSelection = new Subject<PlaceableEntity>();
    signalCancelSelection$ = this.signalCancelSelection.asObservable();

    private selectedEntity: PlaceableEntity | null;
    public sideMenuSelectedEntity: null | PlaceableEntity;
    private isDraggingLeft: boolean = false;
    private isDraggingRight: boolean = false;
    private isDraggingItem: boolean = false;

    constructor() {}

    onMouseEnter(entity: PlaceableEntity) {
        if (entity.visibleState === VisibleState.NotSelected) entity.visibleState = VisibleState.Hovered;
    }

    onMouseLeave(entity: PlaceableEntity) {
        if (entity.visibleState === VisibleState.Hovered) entity.visibleState = VisibleState.NotSelected;
    }

    onMouseDownMapTile(event: MouseEvent, entity: Tile) {
        if (event.button === MouseButton.Left) {
            this.leftClickMapTile(entity);
        } else if (event.button === MouseButton.Right) {
            this.rightClickMapTile(event, entity);
        }
    }

    leftClickMapTile(entity: Tile) {
        this.isDraggingLeft = true;
        if (!this.sideMenuSelectedEntity) return;
        if (entity.isDoor() && (this.sideMenuSelectedEntity as Tile).isDoor()) {
            if (entity instanceof DoorTile) {
                this.signalTileCopy.next({ tile: new OpenDoor(), entity });
                return;
            } else if (entity instanceof OpenDoor) {
                this.signalTileCopy.next({ tile: new DoorTile(), entity });
                return;
            }
        }

        // if (this.sideMenuSelectedEntity.isItem() && entity.isTerrain()) {
        //     this.signalItemPlacer.next({ item: this.sideMenuSelectedEntity as Item, entity });
        //     this.cancelSelectionSideMenu();
        // } else
        if (!this.sideMenuSelectedEntity.isItem()) {
            this.signalTileCopy.next({ tile: this.sideMenuSelectedEntity as Tile, entity });
        }
    }

    rightClickMapTile(event: MouseEvent, entity: Tile) {
        this.isDraggingRight = true;
        event.preventDefault();
        if (entity instanceof GrassTile && !entity.item) return;

        if ((entity as TerrainTile)?.item) {
            this.signalItemRemover.next(entity);
        } else if (!entity.isTerrain() || !(entity as TerrainTile).item) {
            this.signalTileCopy.next({ tile: new GrassTile(), entity });
        }
    }

    onMouseMoveMapTile(entity: Tile) {
        if (this.sideMenuSelectedEntity && !this.sideMenuSelectedEntity.isItem() && this.isDraggingLeft) {
            this.signalTileCopy.next({ tile: this.sideMenuSelectedEntity as Tile, entity });
        }
        if (this.isDraggingRight) {
            if (entity.isTerrain()) {
                this.signalItemRemover.next(entity);
            }
            if (!(entity instanceof GrassTile)) {
                this.signalTileCopy.next({ tile: new GrassTile(), entity });
            }
        }
    }

    onMapTileMouseUp(entity: Tile) {
        if (this.sideMenuSelectedEntity?.isItem() && entity.isTerrain()) {
            this.signalItemPlacer.next({ item: this.sideMenuSelectedEntity as Item, entity });
            this.cancelSelectionSideMenu();
        }
    }

    onMouseUp() {
        if (this.isDraggingItem) {
            this.cancelSelectionSideMenu();
        }
        this.isDraggingLeft = false;
        this.isDraggingRight = false;
    }

    onMouseDownSideMenu(entity: PlaceableEntity) {
        if (entity.visibleState === VisibleState.Disabled) return;

        if (entity.visibleState === VisibleState.Selected) {
            // already selected
            entity.visibleState = VisibleState.NotSelected;
            this.sideMenuSelectedEntity = null;
            this.cancelSelectionMap();
        } else if (this.sideMenuSelectedEntity && this.sideMenuSelectedEntity !== entity) {
            // another entity selected
            this.cancelSelectionSideMenu();
            this.makeSelection(entity);
        } else {
            this.makeSelection(entity);
        }
    }

    makeSelection(entity: PlaceableEntity) {
        entity.visibleState = VisibleState.Selected; // selection of the entity
        this.sideMenuSelectedEntity = entity;
        this.cancelSelectionMap();

        if (entity.isItem()) {
            this.isDraggingItem = true;
        }
    }

    cancelSelectionMap() {
        if (this.selectedEntity) {
            this.signalCancelSelection.next(this.selectedEntity);
            this.selectedEntity = null;
        }
    }

    cancelSelectionSideMenu() {
        if (this.sideMenuSelectedEntity) {
            this.signalCancelSelection.next(this.sideMenuSelectedEntity);

            this.selectedEntity = null;
            this.sideMenuSelectedEntity = null;
            this.isDraggingItem = false;
        }
    }

    getDraggedItem(): Item | null {
        if (this.isDraggingItem) {
            return this.sideMenuSelectedEntity as Item;
        }
        return null;
    }
}
