import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceableEntityContainerComponent } from './placeable-entity-container.component';

describe('PlaceableEntityContainerComponent', () => {
    let component: PlaceableEntityContainerComponent;
    let fixture: ComponentFixture<PlaceableEntityContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlaceableEntityContainerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlaceableEntityContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
