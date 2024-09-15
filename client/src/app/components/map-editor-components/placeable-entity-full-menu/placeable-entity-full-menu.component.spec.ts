import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input } from '@angular/core';
import { PlaceableEntity } from '@app/interfaces/placeable-entity';
import { PlaceableEntityContainerComponent } from '../placeable-entity-container/placeable-entity-container.component';
import { PlaceableEntityFullMenuComponent } from './placeable-entity-full-menu.component';
@Component({
    selector: 'app-placeable-entity-container',
    standalone: true,
    template: '',
})
class MockPlaceableEntityContainerComponent {
    @Input() containerTitle: string;
    @Input() containerItems: PlaceableEntity[];
}
describe('PlaceableEntityFullMenuComponent', () => {
    let component: PlaceableEntityFullMenuComponent;
    let fixture: ComponentFixture<PlaceableEntityFullMenuComponent>;

    beforeEach(async () => {
        TestBed.overrideComponent(PlaceableEntityFullMenuComponent, {
            add: { imports: [MockPlaceableEntityContainerComponent] },
            remove: { imports: [PlaceableEntityContainerComponent] },
        });

        fixture = TestBed.createComponent(PlaceableEntityFullMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component without dependencies', () => {
        expect(component).toBeTruthy();
    });
});
