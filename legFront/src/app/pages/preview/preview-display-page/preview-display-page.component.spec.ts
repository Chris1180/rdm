import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDisplayPageComponent } from './preview-display-page.component';

describe('PreviewDisplayPageComponent', () => {
  let component: PreviewDisplayPageComponent;
  let fixture: ComponentFixture<PreviewDisplayPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewDisplayPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDisplayPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
