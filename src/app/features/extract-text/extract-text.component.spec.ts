import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractTextComponent } from './extract-text.component';

describe('ExtractTextComponent', () => {
  let component: ExtractTextComponent;
  let fixture: ComponentFixture<ExtractTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtractTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
