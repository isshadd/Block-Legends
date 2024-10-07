import { TestBed } from '@angular/core/testing';

import { MapEditorSideMenuService } from './map-editor-side-menu.service';

describe('MapEditorSideMenuService', () => {
  let service: MapEditorSideMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapEditorSideMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
