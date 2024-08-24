import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HideImageComponent } from './hide-image.component';

describe('HideImageComponent', () => {
  let component: HideImageComponent;
  let fixture: ComponentFixture<HideImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HideImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
