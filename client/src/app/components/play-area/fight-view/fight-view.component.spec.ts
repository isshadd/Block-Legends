import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FightViewComponent } from './fight-view.component';

describe('FightViewComponent', () => {
  let component: FightViewComponent;
  let fixture: ComponentFixture<FightViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FightViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FightViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
