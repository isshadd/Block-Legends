import { TestBed } from '@angular/core/testing';

import { BaseTile } from './base-tile';

describe('BaseTile', () => {
  let service: BaseTile;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseTile);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
