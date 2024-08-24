import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractImageComponent } from './extract-image.component';

describe('ExtractImageComponent', () => {
  let component: ExtractImageComponent;
  let fixture: ComponentFixture<ExtractImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtractImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
