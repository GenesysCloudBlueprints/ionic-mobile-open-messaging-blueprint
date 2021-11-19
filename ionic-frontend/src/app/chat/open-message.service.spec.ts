import { TestBed } from '@angular/core/testing';

import { OpenMessageService } from './open-message.service';

describe('OpenMessageServiceService', () => {
  let service: OpenMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

