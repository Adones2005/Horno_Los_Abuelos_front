import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { repartidorGuard } from './repartidor.guard';

describe('repartidorGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => repartidorGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
