import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GrassTile } from '@app/classes/Tiles/base-tile';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { MapEditorManagerService } from '@app/services/map-editor-services/map-editor-manager.service';
import { MapComponent } from './map.component';
import SpyObj = jasmine.SpyObj;

@Component({
    selector: 'app-placeable-entity',
    standalone: true,
    template: '',
})
class MockPlaceableEntityComponent {
    @Input() placeableEntity: PlaceableEntity;
}
describe('MapComponent', () => {
    let mapEditorManagerServiceSpy: SpyObj<MapEditorManagerService>;
    let component: MapComponent;
    let fixture: ComponentFixture<MapComponent>;

    beforeEach(async () => {
        mapEditorManagerServiceSpy = jasmine.createSpyObj('MapEditorManagerService', ['setMapSize']);
        mapEditorManagerServiceSpy.grid = [];
        TestBed.overrideProvider(MapEditorManagerService, { useValue: mapEditorManagerServiceSpy });
        TestBed.overrideComponent(MapComponent, {
            add: { imports: [MockPlaceableEntityComponent] },
            remove: { imports: [PlaceableEntityComponent] },
        });

        fixture = TestBed.createComponent(MapComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component without dependencies', () => {
        expect(component).toBeTruthy();
    });

    it('should call setMapSize on initialization', () => {
        expect(mapEditorManagerServiceSpy.setMapSize).toHaveBeenCalled();
    });

    it('should alert correct tile information on tile click', () => {
        spyOn(window, 'alert');

        const mockTile: GrassTile = new GrassTile();
        mockTile.coordinates = { x: 10, y: 15 };

        component.onTileClick(mockTile);

        expect(window.alert).toHaveBeenCalledWith('BaseTile 10, 15 clicked');
    });
});
