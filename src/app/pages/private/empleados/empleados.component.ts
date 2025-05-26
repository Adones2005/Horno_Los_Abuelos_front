import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EmpleadosService, Empleado } from '../../../core/services/empleados.service';
import { catchError, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-empleados',
  templateUrl: './empleados.component.html',
  imports: [NgIf, NgFor, AsyncPipe],
})
export class EmpleadosComponent implements OnInit {
  private empSvc = inject(EmpleadosService);
  private router = inject(Router);

  empleados$ = of<Empleado[]>([]);
  errorMsg = '';

  ngOnInit(): void { this.load(); }

  /* ---------- cargar lista ---------- */
  load(): void {
    this.empleados$ = this.empSvc.activos().pipe(
      catchError(err => {
        this.errorMsg = err.message ?? 'Error al cargar empleados';
        return of([]);
      })
    );
  }

  /* ---------- confirmación + motivo ---------- */
  async desactivarConfirm(e: Empleado): Promise<void> {
    const first = await Swal.fire({
      title: `¿Desactivar a ${e.nombre}?`,
      text: 'El usuario perderá acceso inmediatamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });

    if (!first.isConfirmed) return;

    const second = await Swal.fire({
      title: 'Motivo de desactivación',
      input: 'textarea',
      inputLabel: 'Escribe al menos 10 caracteres',
      inputValidator: value =>
        !value || value.trim().length < 10 ? 'Motivo demasiado corto' : null,
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    });

    if (second.isConfirmed) {
      this.empSvc.desactivar(e.id /*, second.value*/).subscribe({
        next: () => { Swal.fire('Desactivado', '', 'success'); this.load(); },
        error: err => Swal.fire('Error', err.message, 'error'),
      });
    }
  }

  /* ---------- ir a pendientes ---------- */
  goPendientes(): void {
    this.router.navigateByUrl('/control-panel/aceptar-usuarios');
  }
}
