import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { ItemInfoComponent } from '@app/components/item-info/item-info.component';
import { MapTileInfoComponent } from '@app/components/map-tile-info/map-tile-info.component';
// This line is necessary for the InfoPanelComponent to work and should not be refactored. We have to disable max-len
/* eslint-disable max-len */
import { ItemListContainerComponent } from '@app/components/play-page-components/item-list-container/item-list-container/item-list-container.component';
import { SideViewPlayerInfoComponent } from '@app/components/side-view-player-info/side-view-player-info.component';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager/play-game-board-manager.service';
import { Item } from '@common/classes/Items/item';
import { PlayerCharacter } from '@common/classes/Player/player-character';
import { TerrainTile } from '@common/classes/Tiles/terrain-tile';
import { Tile } from '@common/classes/Tiles/tile';
import { WalkableTile } from '@common/classes/Tiles/walkable-tile';

@Component({
    selector: 'app-info-panel',
    standalone: true,
    imports: [MapTileInfoComponent, ItemInfoComponent, ItemListContainerComponent, SideViewPlayerInfoComponent],
    templateUrl: './info-panel.component.html',
    styleUrl: './info-panel.component.scss',
})
export class InfoPanelComponent {
    @Input() tile: Tile;
    @Output() closePanelEvent = new EventEmitter<void>();

    constructor(@Inject(PlayGameBoardManagerService) public playGameBoardManagerService: PlayGameBoardManagerService) {}

    isWalkableTile(): boolean {
        return this.tile instanceof WalkableTile;
    }

    isTerrainTile(): boolean {
        return this.tile.isTerrain();
    }

    getPlayer(): PlayerCharacter | null {
        const playerMapEntity = (this.tile as WalkableTile).player;
        return playerMapEntity ? this.playGameBoardManagerService.findPlayerFromPlayerMapEntity(playerMapEntity) : null;
    }
    getItem(): Item | null {
        return (this.tile as TerrainTile).item;
    }

    closePanel() {
        this.closePanelEvent.emit();
    }
}
