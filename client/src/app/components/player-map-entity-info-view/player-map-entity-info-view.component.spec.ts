import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerMapEntityInfoViewComponent } from './player-map-entity-info-view.component';

describe('PlayerMapEntityInfoViewComponent', () => {
  let component: PlayerMapEntityInfoViewComponent;
  let fixture: ComponentFixture<PlayerMapEntityInfoViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerMapEntityInfoViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerMapEntityInfoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
