import { TestBed } from '@angular/core/testing';

import { EventJournalService } from './event-journal.service';

describe('EventJournalService', () => {
  let service: EventJournalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventJournalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
