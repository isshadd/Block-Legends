import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { PlayerCharacter } from '@app/classes/Characters/player-character';
import { Item } from '@app/classes/Items/item';
import { TerrainTile } from '@app/classes/Tiles/terrain-tile';
import { Tile } from '@app/classes/Tiles/tile';
import { WalkableTile } from '@app/classes/Tiles/walkable-tile';
import { PlayGameBoardManagerService } from '@app/services/play-page-services/game-board/play-game-board-manager.service';
import { ItemInfoComponent } from '../item-info/item-info.component';
import { MapTileInfoComponent } from '../map-tile-info/map-tile-info.component';
import { PlayerMapEntityInfoViewComponent } from '../player-map-entity-info-view/player-map-entity-info-view.component';

@Component({
    selector: 'app-info-panel',
    standalone: true,
    imports: [MapTileInfoComponent, PlayerMapEntityInfoViewComponent, ItemInfoComponent],
    templateUrl: './info-panel.component.html',
    styleUrl: './info-panel.component.scss',
})
export class InfoPanelComponent {
    @Input() tile: Tile;
    @Output() close = new EventEmitter<void>();

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
        this.close.emit();
    }
}
