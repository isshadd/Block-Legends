import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceableEntityFullMenuComponent } from './placeable-entity-full-menu.component';

describe('PlaceableEntityFullMenuComponent', () => {
  let component: PlaceableEntityFullMenuComponent;
  let fixture: ComponentFixture<PlaceableEntityFullMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceableEntityFullMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceableEntityFullMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
