import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisibleState } from '@common/interfaces/placeable-entity';
import { VisibleStateColor, VisibleStateComponent } from './visible-state.component';

describe('VisibleStateComponent', () => {
    let component: VisibleStateComponent;
    let fixture: ComponentFixture<VisibleStateComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VisibleStateComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VisibleStateComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should return SelectedColor when visibleState is Selected', () => {
        component.visibleState = VisibleState.Selected;
        const color = component.colorSelector();
        expect(color).toBe(VisibleStateColor.SelectedColor);
    });

    it('should return HoveredColor when visibleState is Hovered', () => {
        component.visibleState = VisibleState.Hovered;
        const color = component.colorSelector();
        expect(color).toBe(VisibleStateColor.HoveredColor);
    });

    it('should return ValidColor when visibleState is Valid', () => {
        component.visibleState = VisibleState.Valid;
        const color = component.colorSelector();
        expect(color).toBe(VisibleStateColor.ValidColor);
    });

    it('should return InvalidColor when visibleState is Invalid', () => {
        component.visibleState = VisibleState.Invalid;
        const color = component.colorSelector();
        expect(color).toBe(VisibleStateColor.InvalidColor);
    });

    it('should return DisabledColor when visibleState is Disabled', () => {
        component.visibleState = VisibleState.Disabled;
        const color = component.colorSelector();
        expect(color).toBe(VisibleStateColor.DisabledColor);
    });

    it('should return DisabledColor when visibleState is Disabled', () => {
        component.visibleState = VisibleState.Action;
        const color = component.colorSelector();
        expect(color).toBe(VisibleStateColor.ActionColor);
    });

    it('should return NotSelectedColor when visibleState is not matched', () => {
        component.visibleState = VisibleState.NotSelected;
        const color = component.colorSelector();
        expect(color).toBe(VisibleStateColor.NotSelectedColor);
    });
});
