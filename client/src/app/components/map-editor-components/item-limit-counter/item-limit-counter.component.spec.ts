import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemLimitCounterComponent } from './item-limit-counter.component';

describe('ItemLimitCounterComponent', () => {
    let component: ItemLimitCounterComponent;
    let fixture: ComponentFixture<ItemLimitCounterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ItemLimitCounterComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ItemLimitCounterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
