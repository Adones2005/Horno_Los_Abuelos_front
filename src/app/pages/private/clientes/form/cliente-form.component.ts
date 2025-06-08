import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientesService, Cliente } from '../../../core/services/cliente.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageTitleComponent],
  templateUrl: './cliente-form.component.html',
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  errorMsg = '';
  editMode = false;
  clienteId: number | null = null;

  form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      telefono: ['', [Validators.required, Validators.maxLength(20)]],
    },
    { nonNullable: true }
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.clienteId = +id;
      this.clienteSvc.getById(+id).subscribe({
        next: c => this.form.patchValue(c),
        error: err => (this.errorMsg = err.message ?? 'Error al cargar cliente'),
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const dto = this.form.value as Cliente;
    if (this.editMode && this.clienteId != null) {
      this.clienteSvc
        .update(this.clienteId, dto)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => this.router.navigateByUrl('/control-panel/clientes'),
          error: err => (this.errorMsg = err.message ?? 'Error al guardar'),
        });
    } else {
      this.clienteSvc
        .create(dto)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => this.router.navigateByUrl('/control-panel/clientes'),
          error: err => (this.errorMsg = err.message ?? 'Error al guardar'),
        });
    }
  }

  volver(): void {
    this.router.navigateByUrl('/control-panel/clientes');
  }
}
