import { TestBed } from '@angular/core/testing';

import { MapEditorManagerService } from './map-editor-manager.service';

describe('MapEditorManagerService', () => {
  let service: MapEditorManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapEditorManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
