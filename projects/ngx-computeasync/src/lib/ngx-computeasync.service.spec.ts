import { TestBed } from '@angular/core/testing';

import { NgxComputeasyncService } from './ngx-computeasync.service';

describe('NgxComputeasyncService', () => {
  let service: NgxComputeasyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxComputeasyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
