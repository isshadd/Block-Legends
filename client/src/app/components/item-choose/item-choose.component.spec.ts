import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Item } from '@common/classes/Items/item';
import { ItemChooseComponent } from './item-choose.component';

describe('ItemChooseComponent', () => {
    let component: ItemChooseComponent;
    let fixture: ComponentFixture<ItemChooseComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ItemChooseComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemChooseComponent);
        component = fixture.componentInstance;
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly handle containerItems input', () => {
        const mockItems: Item[] = [new Item(), new Item()];
        component.containerItems = mockItems;
        fixture.detectChanges();

        expect(component.containerItems).toBe(mockItems);
    });

    it('should emit itemClicked event when itemClickedHandler is called', () => {
        const mockItem = new Item();
        spyOn(component.itemClicked, 'emit');

        component.itemClickedHandler(mockItem);

        expect(component.itemClicked.emit).toHaveBeenCalledWith(mockItem);
    });
});
