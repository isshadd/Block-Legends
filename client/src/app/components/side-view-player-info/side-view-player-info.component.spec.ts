import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideViewPlayerInfoComponent } from './side-view-player-info.component';

describe('SideViewPlayerInfoComponent', () => {
  let component: SideViewPlayerInfoComponent;
  let fixture: ComponentFixture<SideViewPlayerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideViewPlayerInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideViewPlayerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
