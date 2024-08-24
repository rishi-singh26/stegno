import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HideTextComponent } from './hide-text.component';

describe('HideTextComponent', () => {
  let component: HideTextComponent;
  let fixture: ComponentFixture<HideTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HideTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
