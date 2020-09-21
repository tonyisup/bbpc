import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpisodeAddComponent } from './episode-add.component';

describe('EpisodeAddComponent', () => {
  let component: EpisodeAddComponent;
  let fixture: ComponentFixture<EpisodeAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpisodeAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpisodeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
