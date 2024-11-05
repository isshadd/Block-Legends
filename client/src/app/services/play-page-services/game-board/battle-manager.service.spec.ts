import { TestBed } from '@angular/core/testing';

import { BattleManagerService } from './battle-manager.service';

describe('BattleManagerService', () => {
  let service: BattleManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BattleManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
