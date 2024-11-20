import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GameMapDataManagerService } from '@app/services/game-board-services/game-map-data-manager.service';
import { MapEditorSideMenuService } from '@app/services/map-editor-services/map-editor-side-menu.service';
import { Item } from '@common/classes/Items/item';
import { PlaceableEntity } from '@common/interfaces/placeable-entity';
import { PlaceableEntityContainerComponent } from './placeable-entity-container.component';

describe('PlaceableEntityContainerComponent', () => {
    let component: PlaceableEntityContainerComponent;
    let fixture: ComponentFixture<PlaceableEntityContainerComponent>;
    let sideMenuServiceSpy: jasmine.SpyObj<MapEditorSideMenuService>;

    beforeEach(async () => {
        const sideMenuServiceSpyObj = jasmine.createSpyObj('MapEditorSideMenuService', [
            'onSideMenuMouseEnter',
            'onSideMenuMouseLeave',
            'onSideMenuMouseDown',
        ]);

        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, PlaceableEntityContainerComponent],
            providers: [
                { provide: GameMapDataManagerService, useValue: {} }, // Mocking GameMapDataManagerService
                { provide: MapEditorSideMenuService, useValue: sideMenuServiceSpyObj }, // Mocking MapEditorSideMenuService
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlaceableEntityContainerComponent);
        component = fixture.componentInstance;
        sideMenuServiceSpy = TestBed.inject(MapEditorSideMenuService) as jasmine.SpyObj<MapEditorSideMenuService>;

        component.containerItems = [{ isItem: () => false } as PlaceableEntity, { isItem: () => true, itemLimit: 5 } as Item];
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call onSideMenuMouseEnter on mouse enter', () => {
        const entity = component.containerItems[0];
        component.onMouseEnter(entity);
        expect(sideMenuServiceSpy.onSideMenuMouseEnter).toHaveBeenCalledWith(entity);
    });

    it('should call onSideMenuMouseLeave on mouse leave', () => {
        const entity = component.containerItems[0];
        component.onMouseLeave(entity);
        expect(sideMenuServiceSpy.onSideMenuMouseLeave).toHaveBeenCalledWith(entity);
    });

    it('should call onSideMenuMouseDown on mouse down', () => {
        const entity = component.containerItems[0];
        const mockEvent = new MouseEvent('mousedown', { button: 0 });
        component.onMouseDown(mockEvent, entity);
        expect(sideMenuServiceSpy.onSideMenuMouseDown).toHaveBeenCalledWith(entity);
    });

    it('should not call onSideMenuMouseDown on right-click (button 2)', () => {
        const entity = component.containerItems[0];
        const mockEvent = new MouseEvent('mousedown', { button: 2 });
        component.onMouseDown(mockEvent, entity);
        expect(sideMenuServiceSpy.onSideMenuMouseDown).not.toHaveBeenCalled();
    });

    it('should prevent default mouse down event behavior', () => {
        const entity = component.containerItems[0];
        const mockEvent = new MouseEvent('mousedown', { button: 0 });
        spyOn(mockEvent, 'preventDefault');

        component.onMouseDown(mockEvent, entity);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should return the item limit if the entity is an Item', () => {
        const item = component.containerItems[1] as Item;
        const itemLimit = 5;
        expect(component.getItemLimit(item)).toBe(itemLimit);
    });

    it('should return 0 if the entity is not an Item', () => {
        const entity = component.containerItems[0];
        expect(component.getItemLimit(entity)).toBe(0);
    });
});
