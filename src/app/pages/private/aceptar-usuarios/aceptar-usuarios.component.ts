import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { EmpleadosService, Empleado } from '../../../core/services/empleados.service';
import { catchError, of, tap } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-aceptar-usuarios',
  templateUrl: './aceptar-usuarios.component.html',
  imports: [NgIf, NgFor, AsyncPipe, PageTitleComponent],
})
export class AceptarUsuariosComponent implements OnInit {
  private empSvc = inject(EmpleadosService);
  private router  = inject(Router);

  empleados$ = of<Empleado[]>([]);
  errorMsg = '';

  ngOnInit(): void { this.load(); }

  /* ---------- cargar pendientes ---------- */
  load(): void {
    this.empleados$ = this.empSvc.pendientes().pipe(
      tap(() => (this.errorMsg = '')),
      catchError(err => { this.errorMsg = err.message; return of([]); })
    );
  }

  /* ---------- aceptar ---------- */
  async aceptar(e: Empleado): Promise<void> {
    const ok = await Swal.fire({
      title: `¿Activar a ${e.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
    });

    if (!ok.isConfirmed) return;

    this.empSvc.activar(e.id).subscribe({
      next: () => { Swal.fire('Activado', '', 'success'); this.load(); },
      error: err => Swal.fire('Error', err.message, 'error'),
    });
  }

  /* ---------- rechazar ---------- */
  async rechazar(e: Empleado): Promise<void> {
    const first = await Swal.fire({
      title: `¿Rechazar a ${e.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });
    if (!first.isConfirmed) return;

    const second = await Swal.fire({
      title: 'Motivo del rechazo',
      input: 'textarea',
      inputLabel: 'Escribe al menos 10 caracteres',
      inputValidator: v =>
        !v || v.trim().length < 10 ? 'Motivo demasiado corto' : null,
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
    });
    if (!second.isConfirmed) return;

    this.empSvc.delete(e.id).subscribe({
      next: () => { Swal.fire('Rechazado', '', 'success'); this.load(); },
      error: err => Swal.fire('Error', err.message, 'error'),
    });
  }

  volver(): void {
    this.router.navigateByUrl('/control-panel/empleados');
  }
}
