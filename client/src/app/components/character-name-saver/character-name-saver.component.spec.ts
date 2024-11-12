import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterNameSaverComponent } from './character-name-saver.component';

describe('CharacterNameSaverComponent', () => {
  let component: CharacterNameSaverComponent;
  let fixture: ComponentFixture<CharacterNameSaverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterNameSaverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CharacterNameSaverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
