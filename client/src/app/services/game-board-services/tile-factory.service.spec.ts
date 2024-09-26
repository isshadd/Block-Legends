import { TestBed } from '@angular/core/testing';

import { TileFactoryService } from './tile-factory.service';

describe('TileFactoryService', () => {
  let service: TileFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TileFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
