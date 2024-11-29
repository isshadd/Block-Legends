import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowDownButtonComponent } from './arrow-down-button.component';

describe('ArrowDownButtonComponent', () => {
  let component: ArrowDownButtonComponent;
  let fixture: ComponentFixture<ArrowDownButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowDownButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrowDownButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
