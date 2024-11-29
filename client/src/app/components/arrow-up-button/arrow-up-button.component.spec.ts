import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrowUpButtonComponent } from './arrow-up-button.component';

describe('ArrowUpButtonComponent', () => {
  let component: ArrowUpButtonComponent;
  let fixture: ComponentFixture<ArrowUpButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowUpButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrowUpButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
