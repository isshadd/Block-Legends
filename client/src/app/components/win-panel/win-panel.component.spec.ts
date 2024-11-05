import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinPanelComponent } from './win-panel.component';

describe('WinPanelComponent', () => {
  let component: WinPanelComponent;
  let fixture: ComponentFixture<WinPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
