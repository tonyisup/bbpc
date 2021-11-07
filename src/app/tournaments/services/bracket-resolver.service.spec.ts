import { TestBed } from '@angular/core/testing';

import { BracketResolverService } from './bracket-resolver.service';

describe('BracketResolverService', () => {
  let service: BracketResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BracketResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
