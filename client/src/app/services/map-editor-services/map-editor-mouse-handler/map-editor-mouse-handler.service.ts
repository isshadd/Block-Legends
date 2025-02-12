import { Injectable } from '@angular/core';
import { Item } from '@common/classes/Items/item';
import { DoorTile } from '@common/classes/Tiles/door-tile';
import { GrassTile } from '@common/classes/Tiles/grass-tile';
import { OpenDoor } from '@common/classes/Tiles/open-door';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { ItemType } from '@common/enums/item-type';
import { PlaceableEntity, VisibleState } from '@common/interfaces/placeable-entity';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';

export enum MouseButton {
    Left = 0,
    Right = 2,
}

@Injectable({
    providedIn: 'root',
})
export class MapEditorMouseHandlerService {
    signalTileCopy = new Subject<{ tile: Tile; entity: Tile }>();
    signalTileCopy$ = this.signalTileCopy.asObservable();

    signalItemPlacer = new Subject<{ item: Item; entity: Tile }>();
    signalItemPlacer$ = this.signalItemPlacer.asObservable();

    signalItemRemover = new Subject<Tile>();
    signalItemRemover$ = this.signalItemRemover.asObservable();

    signalItemDragged = new Subject<ItemType>();
    signalItemDragged$ = this.signalItemDragged.asObservable();

    signalCancelSelection = new Subject<PlaceableEntity>();
    signalCancelSelection$ = this.signalCancelSelection.asObservable();

    signalItemPlacerWithCoordinates = new Subject<{ item: Item; coordinates: Vec2 }>();
    signalItemPlacerWithCoordinates$ = this.signalItemPlacerWithCoordinates.asObservable();

    signalItemInPlace = new Subject<{ item: Item; coordinates: Vec2 }>();
    signalItemInPlace$ = this.signalItemInPlace.asObservable();

    sideMenuSelectedEntity: null | PlaceableEntity;
    private isDraggingLeft: boolean = false;
    private isDraggingRight: boolean = false;
    private isDraggingItem: boolean = false;
    private lastDraggedItem: Item | null = null;
    private lastDraggedItemCoordinates: Vec2 | null = null;
    private isMouseInMap: boolean = false;
    private isItemInPlace: boolean = false;

    onMouseEnter(entity: PlaceableEntity) {
        if (this.isDraggingItem && entity.isItem()) {
            if (this.getDraggedItem() === entity) {
                this.isItemInPlace = true;
            }
        }
        if (entity.visibleState === VisibleState.NotSelected) {
            entity.visibleState = VisibleState.Hovered;
            this.isItemInPlace = false;
        }
    }

    onMouseLeave(entity: PlaceableEntity) {
        if (entity.visibleState === VisibleState.Hovered) entity.visibleState = VisibleState.NotSelected;
    }

    onMouseDownMapTile(event: MouseEvent, entity: Tile) {
        if (event.button === MouseButton.Left) {
            this.leftMouseDownMapTile(entity);
        } else if (event.button === MouseButton.Right) {
            this.rightMouseDownMapTile(event, entity);
        }
    }

    leftMouseDownMapTile(entity: Tile) {
        if (entity.isTerrain()) {
            const terrainTile = entity as TerrainTile;
            if (terrainTile.item) {
                const itemType = terrainTile.item.type;
                this.lastDraggedItemCoordinates = terrainTile.coordinates;

                this.signalItemRemover.next(entity);
                this.signalItemDragged.next(itemType);
                return;
            }
        }

        if (!this.sideMenuSelectedEntity) return;
        this.isDraggingLeft = true;

        if (entity.isDoor() && (this.sideMenuSelectedEntity as Tile).isDoor()) {
            if (entity instanceof DoorTile) {
                this.signalTileCopy.next({ tile: new OpenDoor(), entity });
                return;
            } else if (entity instanceof OpenDoor) {
                this.signalTileCopy.next({ tile: new DoorTile(), entity });
                return;
            }
        }

        if (!this.sideMenuSelectedEntity.isItem()) {
            this.signalTileCopy.next({ tile: this.sideMenuSelectedEntity as Tile, entity });
        }
    }

    rightMouseDownMapTile(event: MouseEvent, entity: Tile) {
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
        } else if (this.lastDraggedItemCoordinates) {
            this.signalItemPlacerWithCoordinates.next({
                item: this.sideMenuSelectedEntity as Item,
                coordinates: this.lastDraggedItemCoordinates,
            });
        }
    }

    onMouseUp() {
        if (this.isDraggingItem) {
            if (this.isItemInPlace) {
                this.signalItemInPlace.next({ item: this.lastDraggedItem as Item, coordinates: this.lastDraggedItemCoordinates as Vec2 });
            } else if (this.isItemOutOfMap() && this.lastDraggedItemCoordinates) {
                this.signalItemPlacerWithCoordinates.next({ item: this.lastDraggedItem as Item, coordinates: this.lastDraggedItemCoordinates });
            }
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
        } else if (this.sideMenuSelectedEntity && this.sideMenuSelectedEntity !== entity) {
            // another entity selected
            this.cancelSelectionSideMenu();
            this.makeSelection(entity);
        } else {
            this.makeSelection(entity);
        }
    }

    makeSelection(entity: PlaceableEntity) {
        entity.visibleState = VisibleState.Selected;
        this.sideMenuSelectedEntity = entity;

        if (entity.isItem()) {
            this.isDraggingItem = true;
            this.lastDraggedItem = entity as Item;
        } else {
            this.isDraggingItem = false;
        }
    }

    cancelSelectionSideMenu() {
        if (this.sideMenuSelectedEntity) {
            this.signalCancelSelection.next(this.sideMenuSelectedEntity);

            this.sideMenuSelectedEntity = null;
            this.isDraggingItem = false;
        }
    }

    getDraggedItem(): Item | null {
        if (this.isDraggingItem && this.sideMenuSelectedEntity?.isItem()) {
            return this.sideMenuSelectedEntity as Item;
        }
        return null;
    }

    setMouseInMap(isMouseInMap: boolean) {
        this.isMouseInMap = isMouseInMap;
    }

    setLastDraggedItemCoordinates(coordinates: Vec2 | null) {
        this.lastDraggedItemCoordinates = coordinates;
    }

    isItemOutOfMap(): boolean {
        return !this.isMouseInMap && this.lastDraggedItem !== null;
    }
}
