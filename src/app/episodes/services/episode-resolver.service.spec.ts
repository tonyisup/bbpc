import { TestBed } from '@angular/core/testing';

import { EpisodeResolverService } from './episode-resolver.service';

describe('EpisodeResolverService', () => {
  let service: EpisodeResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpisodeResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
