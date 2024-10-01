import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceableEntity, VisibleState } from '@app/interfaces/placeable-entity';
import { VisibleStateColor, VisibleStateComponent } from './visible-state.component';

describe('EntityContainerComponent', () => {
    let component: VisibleStateComponent;
    let fixture: ComponentFixture<VisibleStateComponent>;
    let mockPlaceableEntity: PlaceableEntity;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VisibleStateComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VisibleStateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        mockPlaceableEntity = {
            visibleState: VisibleState.notSelected,
            description: 'Test Entity',
            coordinates: { x: 0, y: 0 },
            imageUrl: 'test-image-url',
        };
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return SELECTED_COLOR when visibleState is selected', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.selected };
        expect(component.colorSelector()).toBe(VisibleStateColor.SELECTED_COLOR);
    });

    it('should return HOVERED_COLOR when visibleState is hovered', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.hovered };
        expect(component.colorSelector()).toBe(VisibleStateColor.HOVERED_COLOR);
    });

    it('should return VALID_COLOR when visibleState is valid', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.valid };
        expect(component.colorSelector()).toBe(VisibleStateColor.VALID_COLOR);
    });

    it('should return INVALID_COLOR when visibleState is invalid', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.invalid };
        expect(component.colorSelector()).toBe(VisibleStateColor.INVALID_COLOR);
    });

    it('should return DISABLED_COLOR when visibleState is disabled', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.disabled };
        expect(component.colorSelector()).toBe(VisibleStateColor.DISABLED_COLOR);
    });

    it('should return NOT_SELECTED_COLOR when visibleState is notSelected', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.notSelected };
        expect(component.colorSelector()).toBe(VisibleStateColor.NOT_SELECTED_COLOR);
    });
});
