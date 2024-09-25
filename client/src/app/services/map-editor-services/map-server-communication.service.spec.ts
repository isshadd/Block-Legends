import { TestBed } from '@angular/core/testing';

import { MapServerCommunicationService } from './map-server-communication.service';

describe('MapServerCommunicationService', () => {
  let service: MapServerCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapServerCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
