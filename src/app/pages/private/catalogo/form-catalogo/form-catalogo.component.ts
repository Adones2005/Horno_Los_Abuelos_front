import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, Validators,
  FormGroup, FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, of, tap } from 'rxjs';

import { PastelesService, Pastel, PastelForm } from
  '../../../../core/services/pasteles.service';
import { EspecificacionesService, Especificacion }
  from '../../../../core/services/especificacion.service';
import { environment } from '../../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-form-catalogo',
  templateUrl: './form-catalogo.component.html',
  styleUrls: ['./form-catalogo.component.scss'],
  imports: [NgIf, NgFor, AsyncPipe, ReactiveFormsModule, RouterLink],
})
export class FormCatalogoComponent implements OnInit {

  private fb        = inject(FormBuilder);
  private pastelSvc = inject(PastelesService);
  private especSvc  = inject(EspecificacionesService);
  private route     = inject(ActivatedRoute);
  private router    = inject(Router);

  readonly apiUrl = environment.apiUrl;

  form: FormGroup = this.fb.group({
    id:     [null],
    nombre: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    imagen: new FormControl<File | null>(null, Validators.required),
    especificaciones: new FormControl<number[]>([]),
  });

  seleccion = new Set<number>();
  imagePreview: string | null = null;
  imgError = '';
  loading  = false;
  errorMsg = '';

  especificaciones$ = this.especSvc.getAll();

  ngOnInit() {
    /* Si hay :id ⇒ editar */
    this.route.paramMap.pipe(
      switchMap(p => p.get('id')
        ? this.pastelSvc.getOne(+p.get('id')!)   
        : of<Pastel | null>(null))               
    ).subscribe(pastel => {
      if (!pastel) return;
      this.seleccion = new Set(pastel.especificaciones ?? []);
      this.form.patchValue({
        id: pastel.id,
        nombre: pastel.nombre,
        precio: pastel.precio,
        especificaciones: [...this.seleccion],
      });
      this.imagePreview = this.apiUrl + '/images/' + pastel.imagen;
      this.form.get('imagen')!.clearValidators();
      this.form.get('imagen')!.updateValueAndValidity();
    });
  }

  /* checkbox */
  toggle(id: number, checked: boolean) {
    checked ? this.seleccion.add(id) : this.seleccion.delete(id);
    this.form.patchValue({ especificaciones: [...this.seleccion] });
  }

  /* imagen + preview */
  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    if (!/\.(png|jpe?g|webp)$/i.test(file.name)) {
      this.imgError = 'Formato no admitido (PNG, JPG o WEBP)';
      input.value = '';
      return;
    }
    this.imgError = '';
    this.form.patchValue({ imagen: file });

    /* preview */
    const reader = new FileReader();
    reader.onload = e => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  /* submit create / update */
   guardar() {
    if (this.form.invalid) return;

    this.loading = true;
    const dto: PastelForm = {
      nombre: this.form.value.nombre!,
      precio: this.form.value.precio!,
      imagen: this.form.value.imagen ?? null,
      especificaciones: this.form.value.especificaciones ?? [],
    };

    const id  = this.form.value.id;
    const obs = id ? this.pastelSvc.update(id, dto) : this.pastelSvc.create(dto);

    obs.pipe(
      tap(() => this.loading = false)
    ).subscribe({
      next: () => this.router.navigate(['/control-panel/catalogo-interno'], { relativeTo: this.route }),  // ← redirección
      error: err => { this.errorMsg = err.message; this.loading = false; },
    });
  }

  cancelar() {
    this.router.navigate(['/control-panel/catalogo-interno'], { relativeTo: this.route });
  }
}
