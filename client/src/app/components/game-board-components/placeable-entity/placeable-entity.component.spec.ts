import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceableEntityComponent } from './placeable-entity.component';

describe('PlaceableEntityComponent', () => {
    let component: PlaceableEntityComponent;
    let fixture: ComponentFixture<PlaceableEntityComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlaceableEntityComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PlaceableEntityComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
