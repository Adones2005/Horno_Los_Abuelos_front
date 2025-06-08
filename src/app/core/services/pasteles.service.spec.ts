import { TestBed } from '@angular/core/testing';

import { PastelesService } from './pasteles.service';

describe('PastelesService', () => {
  let service: PastelesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PastelesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
