import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageShowcaseComponent } from './image-showcase.component';

describe('ImageShowcaseComponent', () => {
  let component: ImageShowcaseComponent;
  let fixture: ComponentFixture<ImageShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
