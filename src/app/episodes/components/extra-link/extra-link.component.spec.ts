import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraLinkComponent } from './extra-link.component';

describe('ExtraLinkComponent', () => {
  let component: ExtraLinkComponent;
  let fixture: ComponentFixture<ExtraLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtraLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtraLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
