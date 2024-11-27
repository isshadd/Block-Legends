import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Item } from '@common/classes/Items/item';
import { VisibleState } from '@common/interfaces/placeable-entity';
import { ItemListContainerComponent } from './item-list-container.component';

describe('ItemListContainerComponent', () => {
    let component: ItemListContainerComponent;
    let fixture: ComponentFixture<ItemListContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ItemListContainerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemListContainerComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should set item visibleState to Hovered on onMouseEnter', () => {
        const mockItem = new Item();
        mockItem.visibleState = VisibleState.NotSelected; 

        component.onMouseEnter(mockItem);

        expect(mockItem.visibleState).not.toBe(VisibleState.NotSelected);
    });

    it('should set item visibleState to NotSelected on onMouseLeave', () => {
        const mockItem = new Item();
        mockItem.visibleState = VisibleState.Hovered;

        component.onMouseLeave(mockItem);

        expect(mockItem.visibleState).not.toBe(VisibleState.Hovered);
    });

    it('should emit itemClicked event on left-click in onMouseDown', () => {
        const mockItem = new Item();
        spyOn(component.itemClicked, 'emit');
        const event = new MouseEvent('mousedown', { button: 0 }); 
        spyOn(event, 'preventDefault'); 

        component.onMouseDown(event, mockItem);

        expect(component.itemClicked.emit).toHaveBeenCalledWith(mockItem);
        expect(event.preventDefault).toHaveBeenCalled(); 
    });

    it('should not emit itemClicked event on right-click in onMouseDown', () => {
        const mockItem = new Item();
        spyOn(component.itemClicked, 'emit');
        const event = new MouseEvent('mousedown', { button: 2 }); 

        component.onMouseDown(event, mockItem);

        expect(component.itemClicked.emit).not.toHaveBeenCalled();
    });
});
