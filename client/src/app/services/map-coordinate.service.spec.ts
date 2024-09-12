import { TestBed } from '@angular/core/testing';

import { MapCoordinateService } from './map-coordinate.service';

describe('MapCoordinateService', () => {
  let service: MapCoordinateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapCoordinateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
