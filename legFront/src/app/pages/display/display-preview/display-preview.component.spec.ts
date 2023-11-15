import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPreviewComponent } from './display-preview.component';

describe('DisplayPreviewComponent', () => {
  let component: DisplayPreviewComponent;
  let fixture: ComponentFixture<DisplayPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayPreviewComponent]
    });
    fixture = TestBed.createComponent(DisplayPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
