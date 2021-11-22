import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraEditComponent } from './extra-edit.component';

describe('ExtraEditComponent', () => {
  let component: ExtraEditComponent;
  let fixture: ComponentFixture<ExtraEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtraEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtraEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
