import { Component } from '@angular/core';
import { ComponentFixture, MetadataOverride, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MapComponent } from '@app/components/game-board-components/map/map.component';
// eslint-disable-next-line max-len
import { PlaceableEntityFullMenuComponent } from '@app/components/map-editor-components/placeable-entity-full-menu/placeable-entity-full-menu.component';
import { MapEditorComponent } from './map-editor.component';
@Component({
    selector: 'app-map',
    standalone: true,
    template: '',
})
class MockMapComponent {}

@Component({
    selector: 'app-placeable-entity-full-menu',
    standalone: true,
    template: '',
})
class MockPlaceableEntityFullMenuComponent {}

describe('MapEditorComponent', () => {
    let component: MapEditorComponent;
    let fixture: ComponentFixture<MapEditorComponent>;

    beforeEach(async () => {
        const overrideInfo: MetadataOverride<MapEditorComponent> = {
            add: { imports: [MockMapComponent] },
            remove: { imports: [MapComponent] },
        };
        TestBed.overrideComponent(MapEditorComponent, overrideInfo);

        TestBed.overrideComponent(MapEditorComponent, {
            add: { imports: [MockPlaceableEntityFullMenuComponent] },
            remove: { imports: [PlaceableEntityFullMenuComponent] },
        });

        TestBed.configureTestingModule({
            imports: [MapEditorComponent],
            providers: [{ provide: ActivatedRoute, useValue: {} }],
        });

        fixture = TestBed.createComponent(MapEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component without dependencies', () => {
        expect(component).toBeTruthy();
    });
});
