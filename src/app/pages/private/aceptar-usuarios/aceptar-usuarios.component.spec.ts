import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AceptarUsuariosComponent } from './aceptar-usuarios.component';

describe('AceptarUsuariosComponent', () => {
  let component: AceptarUsuariosComponent;
  let fixture: ComponentFixture<AceptarUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AceptarUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AceptarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
