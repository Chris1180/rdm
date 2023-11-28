import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputComponent } from './output.component';

describe('CommandComponent', () => {
  let component: OutputComponent;
  let fixture: ComponentFixture<OutputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OutputComponent]
    });
    fixture = TestBed.createComponent(OutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
