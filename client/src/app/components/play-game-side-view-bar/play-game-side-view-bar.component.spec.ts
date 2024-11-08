import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayGameSideViewBarComponent } from './play-game-side-view-bar.component';

describe('PlayGameSideViewBarComponent', () => {
  let component: PlayGameSideViewBarComponent;
  let fixture: ComponentFixture<PlayGameSideViewBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayGameSideViewBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayGameSideViewBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
