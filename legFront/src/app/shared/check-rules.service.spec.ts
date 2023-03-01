import { TestBed } from '@angular/core/testing';

import { CheckRulesService } from './check-rules.service';

describe('CheckRulesService', () => {
  let service: CheckRulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckRulesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
