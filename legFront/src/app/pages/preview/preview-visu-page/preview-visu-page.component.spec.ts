import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewVisuPageComponent } from './preview-visu-page.component';

describe('PreviewVisuPageComponent', () => {
  let component: PreviewVisuPageComponent;
  let fixture: ComponentFixture<PreviewVisuPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewVisuPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewVisuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
