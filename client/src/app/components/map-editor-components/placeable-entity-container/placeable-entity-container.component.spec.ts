import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaceableEntityComponent } from '@app/components/game-board-components/placeable-entity/placeable-entity.component';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { PlaceableEntityContainerComponent } from './placeable-entity-container.component';

@Component({
    selector: 'app-placeable-entity',
    standalone: true,
    template: '',
})
class MockPlaceableEntityComponent {
    @Input() placeableEntity: PlaceableEntity;
}

describe('PlaceableEntityContainerComponent', () => {
    let component: PlaceableEntityContainerComponent;
    let fixture: ComponentFixture<PlaceableEntityContainerComponent>;

    beforeEach(async () => {
        TestBed.overrideComponent(PlaceableEntityContainerComponent, {
            add: { imports: [MockPlaceableEntityComponent] },
            remove: { imports: [PlaceableEntityComponent] },
        });

        fixture = TestBed.createComponent(PlaceableEntityContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component without dependencies', () => {
        expect(component).toBeTruthy();
    });
});
