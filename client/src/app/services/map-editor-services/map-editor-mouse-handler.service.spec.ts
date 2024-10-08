import { TestBed } from '@angular/core/testing';

import { MapEditorMouseHandlerService } from './map-editor-mouse-handler.service';

describe('MapEditorMouseHandlerService', () => {
  let service: MapEditorMouseHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapEditorMouseHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
