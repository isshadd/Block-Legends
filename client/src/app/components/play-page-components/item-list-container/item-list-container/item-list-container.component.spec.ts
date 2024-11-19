import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemListContainerComponent } from './item-list-container.component';

describe('ItemListContainerComponent', () => {
  let component: ItemListContainerComponent;
  let fixture: ComponentFixture<ItemListContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemListContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemListContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
