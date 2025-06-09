
import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor, AsyncPipe, CurrencyPipe } from '@angular/common';
import Swal from 'sweetalert2';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { of, catchError } from 'rxjs';

import {
  PastelesService,
  Pastel,
} from '../../../core/services/pasteles.service';

import {
  EspecificacionesService,
  Especificacion,
} from '../../../core/services/especificacion.service';

import { environment } from '../../../../environments/environment';

/* DTO que enviamos al backend (create / update) */
interface PastelForm {
  nombre: string;
  precio: number;
  imagen: File | null;
  especificaciones: number[];
}

@Component({
  standalone: true,
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss'],
  imports: [NgIf, NgFor, AsyncPipe, CurrencyPipe, ReactiveFormsModule],
})
export class CatalogoComponent implements OnInit {
  /* ────────── inyección de dependencias ────────── */
  private pastelSvc = inject(PastelesService);
  private especSvc  = inject(EspecificacionesService);
  private fb        = inject(FormBuilder);

  /* ────────── constantes ────────── */
  readonly apiUrl = environment.apiUrl;

  /* ────────── streams ────────── */
  pasteles$         = of<Pastel[]>([]);
  especificaciones$ = of<Especificacion[]>([]);
  errorMsg          = '';

  /* ────────── estado de UI ────────── */
  showForm = signal(false);
  loading  = false;
  imgError = '';
  /** IDs marcados en los checkbox */
  seleccion = new Set<number>();

  /* ────────── formulario reactivo ────────── */
  form: FormGroup = this.fb.group({
    id:     [null],
    nombre: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    imagen: new FormControl<File | null>(null, Validators.required),
    especificaciones: new FormControl<number[]>([]),
  });

  /* ────────── ciclo ────────── */
  ngOnInit(): void {
    this.load();
    this.especificaciones$ = this.especSvc.getAll();
  }

  /* ────────── carga de pasteles ────────── */
  private load(): void {
    this.pasteles$ = this.pastelSvc.getAll().pipe(
      catchError(err => {
        this.errorMsg = err.message ?? 'Error al cargar pasteles';
        return of([]);
      })
    );
  }

  /* ────────── checkbox de especificaciones ────────── */
  toggleEspecificacion(id: number, checked: boolean): void {
    checked ? this.seleccion.add(id) : this.seleccion.delete(id);
    this.form.patchValue({ especificaciones: Array.from(this.seleccion) });
  }

  /* ────────── input file ────────── */
  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!/(\.png|\.jpe?g|\.webp)$/i.test(file.name)) {
      this.imgError = 'Formato no admitido (usa PNG, JPG o WEBP)';
      this.form.patchValue({ imagen: null });
      input.value = '';
    } else {
      this.imgError = '';
      this.form.patchValue({ imagen: file });
    }
  }

  /* ────────── abrir / cerrar formulario ────────── */
  abrirForm(): void {
    this.seleccion.clear();
    this.form.reset({ id: null, precio: 0, especificaciones: [] });
    this.imgError = '';
    this.showForm.set(true);
  }

  edit(p: Pastel): void {
    this.seleccion = new Set(p.especificaciones ?? []);
    this.form.reset({
      id:     p.id,
      nombre: p.nombre,
      precio: p.precio,
      imagen: null,                    // el usuario subirá otro si quiere
      especificaciones: [...this.seleccion],
    });
    this.imgError = '';
    this.showForm.set(true);
  }

  /* ────────── create / update ────────── */
  submit(): void {
    if (this.form.invalid) return;

    const dto: PastelForm = {
      nombre: this.form.value.nombre!,
      precio: this.form.value.precio!,
      imagen: this.form.value.imagen!,
      especificaciones: this.form.value.especificaciones ?? [],
    };

    console.log(dto);

    this.loading = true;
    const id   = this.form.value.id;
    const obs$ = id
      ? this.pastelSvc.update(id, dto)
      : this.pastelSvc.create(dto);

    obs$.subscribe({
      next: () => {
        this.load();
        this.showForm.set(false);
      },
      error: err => (this.errorMsg = err.message),
      complete: () => (this.loading = false),
    });
  }

 /* ────────── delete con SweetAlert2 ────────── */
eliminar(id: number): void {
  Swal.fire({
    title: '¿Eliminar pastel?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e63946',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then(result => {
    if (!result.isConfirmed) return;

    this.pastelSvc.delete(id).subscribe({
      next: () => {
        this.load();
        Swal.fire({
          title: 'Eliminado',
          text: 'El pastel se ha borrado correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: err => {
        Swal.fire('Error', err.message ?? 'No se pudo eliminar', 'error');
      },
    });
  });
}}