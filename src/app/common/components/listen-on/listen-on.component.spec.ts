import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListenOnComponent } from './listen-on.component';

describe('ListenOnComponent', () => {
  let component: ListenOnComponent;
  let fixture: ComponentFixture<ListenOnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListenOnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListenOnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
