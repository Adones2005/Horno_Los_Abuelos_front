// src/app/pages/public/registrar/registrar.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { Router, RouterModule } from '@angular/router';
import { EmpleadosService, Empleado } from '../../../core/services/empleados.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageTitleComponent],
  templateUrl: './registrar.component.html',
})
export class RegistrarComponent {
  private fb   = inject(FormBuilder);
  private empS = inject(EmpleadosService);
  private router = inject(Router);

  loading  = false;
  errorMsg = '';
  success  = false;

  form = this.fb.group(
  {
    nombre:   ['', [Validators.required, Validators.maxLength(255)]],
    username: ['', [Validators.required, Validators.maxLength(50)]],
    email:    ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    rolId:    3 as number,                    
  },
  { nonNullable: true }           
);


  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    const dto = this.form.value as Empleado;

    this.empS.create(dto)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => { this.success = true; setTimeout(() => this.router.navigateByUrl('/identificarse'), 1500); },
        error: err => this.errorMsg = err.message ?? 'Error al registrar',
      });
  }
}
