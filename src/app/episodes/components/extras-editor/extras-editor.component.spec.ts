import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtrasEditorComponent } from './extras-editor.component';

describe('ExtrasEditorComponent', () => {
  let component: ExtrasEditorComponent;
  let fixture: ComponentFixture<ExtrasEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtrasEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtrasEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
