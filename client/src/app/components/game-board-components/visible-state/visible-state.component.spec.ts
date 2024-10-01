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
            visibleState: VisibleState.NotSelected,
            description: 'Test Entity',
            coordinates: { x: 0, y: 0 },
            imageUrl: 'test-image-url',
        };
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return SELECTED_COLOR when visibleState is selected', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.Selected };
        expect(component.colorSelector()).toBe(VisibleStateColor.SelectedColor);
    });

    it('should return HOVERED_COLOR when visibleState is hovered', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.Hovered };
        expect(component.colorSelector()).toBe(VisibleStateColor.HoveredColor);
    });

    it('should return VALID_COLOR when visibleState is valid', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.Valid };
        expect(component.colorSelector()).toBe(VisibleStateColor.ValidColor);
    });

    it('should return INVALID_COLOR when visibleState is invalid', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.Invalid };
        expect(component.colorSelector()).toBe(VisibleStateColor.InvalidColor);
    });

    it('should return DISABLED_COLOR when visibleState is disabled', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.Disabled };
        expect(component.colorSelector()).toBe(VisibleStateColor.DisabledColor);
    });

    it('should return NOT_SELECTED_COLOR when visibleState is notSelected', () => {
        component.placeableEntity = { ...mockPlaceableEntity, visibleState: VisibleState.NotSelected };
        expect(component.colorSelector()).toBe(VisibleStateColor.NotSelectedColor);
    });
});
