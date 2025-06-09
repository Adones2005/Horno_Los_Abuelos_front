import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCatalogoComponent } from './form-catalogo.component';

describe('FormCatalogoComponent', () => {
  let component: FormCatalogoComponent;
  let fixture: ComponentFixture<FormCatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
