import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventJournalComponent } from './event-journal.component';

describe('EventJournalComponent', () => {
  let component: EventJournalComponent;
  let fixture: ComponentFixture<EventJournalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventJournalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
