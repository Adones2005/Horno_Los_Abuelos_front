import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PageTitleComponent } from '../../../../shared/page-title/page-title.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PastelesService, Pastel } from '../../../../core/services/pasteles.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-pastel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageTitleComponent],
  templateUrl: './pastel-form.component.html',
})
export class PastelFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pastelSvc = inject(PastelesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  errorMsg = '';
  editMode = false;
  pastelId: number | null = null;

  form = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      imagen: ['', [Validators.required, Validators.maxLength(255)]],
    },
    { nonNullable: true }
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.pastelId = +id;
      this.pastelSvc.getById(+id).subscribe({
        next: p => this.form.patchValue(p),
        error: err => (this.errorMsg = err.message ?? 'Error al cargar pastel'),
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const dto = this.form.value as Omit<Pastel, 'id'>;
    if (this.editMode && this.pastelId != null) {
      this.pastelSvc
        .update(this.pastelId, dto)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => this.router.navigateByUrl('/control-panel/catalogo'),
          error: err => (this.errorMsg = err.message ?? 'Error al guardar'),
        });
    } else {
      this.pastelSvc
        .create(dto)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => this.router.navigateByUrl('/control-panel/catalogo'),
          error: err => (this.errorMsg = err.message ?? 'Error al guardar'),
        });
    }
  }

  volver(): void {
    this.router.navigateByUrl('/control-panel/catalogo');
  }
}
