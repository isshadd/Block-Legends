import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapEditorOptionsMenuComponent } from './map-editor-options-menu.component';

describe('MapEditorOptionsMenuComponent', () => {
  let component: MapEditorOptionsMenuComponent;
  let fixture: ComponentFixture<MapEditorOptionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapEditorOptionsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapEditorOptionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
