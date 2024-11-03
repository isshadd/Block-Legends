import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfosGameComponent } from './infos-game.component';

describe('InfosGameComponent', () => {
  let component: InfosGameComponent;
  let fixture: ComponentFixture<InfosGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfosGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfosGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
