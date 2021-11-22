import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentLinkComponent } from './assignment-link.component';

describe('AssignmentLinkComponent', () => {
  let component: AssignmentLinkComponent;
  let fixture: ComponentFixture<AssignmentLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
