import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeEditComponent } from './episode-edit.component';

describe('EpisodeEditComponent', () => {
  let component: EpisodeEditComponent;
  let fixture: ComponentFixture<EpisodeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpisodeEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpisodeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
