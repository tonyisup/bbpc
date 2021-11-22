import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieLinkComponent } from './movie-link.component';

describe('MovieLinkComponent', () => {
  let component: MovieLinkComponent;
  let fixture: ComponentFixture<MovieLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovieLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
