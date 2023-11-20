import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayRulesAppliedComponent } from './display-rules-applied.component';

describe('DisplayRulesAppliedComponent', () => {
  let component: DisplayRulesAppliedComponent;
  let fixture: ComponentFixture<DisplayRulesAppliedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayRulesAppliedComponent]
    });
    fixture = TestBed.createComponent(DisplayRulesAppliedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
