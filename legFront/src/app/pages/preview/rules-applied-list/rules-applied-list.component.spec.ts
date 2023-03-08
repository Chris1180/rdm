import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesAppliedListComponent } from './rules-applied-list.component';

describe('RulesAppliedListComponent', () => {
  let component: RulesAppliedListComponent;
  let fixture: ComponentFixture<RulesAppliedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RulesAppliedListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RulesAppliedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
