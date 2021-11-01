import { TestBed } from '@angular/core/testing';

import { EpisodesResolverService } from './episodes-resolver.service';

describe('EpisodesResolverService', () => {
  let service: EpisodesResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpisodesResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
