import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepartosComponent } from './repartos.component';

describe('RepartosComponent', () => {
  let component: RepartosComponent;
  let fixture: ComponentFixture<RepartosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepartosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepartosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
