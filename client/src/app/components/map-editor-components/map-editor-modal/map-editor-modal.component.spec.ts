import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapEditorModalComponent } from './map-editor-modal.component';

describe('MapEditorModalComponent', () => {
  let component: MapEditorModalComponent;
  let fixture: ComponentFixture<MapEditorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapEditorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapEditorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
