import { TestBed } from '@angular/core/testing';

import { GameGestionService } from './game-gestion.service';

describe('GameGestionService', () => {
  let service: GameGestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameGestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
