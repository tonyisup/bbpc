import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentsEditorComponent } from './assignments-editor.component';

describe('AssignmentsEditorComponent', () => {
  let component: AssignmentsEditorComponent;
  let fixture: ComponentFixture<AssignmentsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentsEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
