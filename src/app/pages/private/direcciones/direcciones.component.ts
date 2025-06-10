import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { DireccionesService, Direccion } from '../../../core/services/direcciones.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-direcciones',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, PageTitleComponent],
  templateUrl: './direcciones.component.html',
})
export class DireccionesComponent implements OnInit {
  private dirSvc = inject(DireccionesService);
  private router = inject(Router);

  direcciones$ = of<Direccion[]>([]);
  errorMsg = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.direcciones$ = this.dirSvc.getAll().pipe(
      catchError(err => {
        this.errorMsg = err.message ?? 'Error al cargar direcciones';
        return of([]);
      })
    );
  }

  nuevo(): void {
    this.router.navigateByUrl('/control-panel/direcciones/nuevo');
  }

  editar(d: Direccion): void {
    this.router.navigateByUrl(`/control-panel/direcciones/${d.id}`);
  }

  borrarConfirm(d: Direccion): void {
    if (!confirm(`¿Borrar la dirección "${d.calle}"?`)) return;
    this.dirSvc.delete(d.id).subscribe({
      next: () => this.load(),
      error: err => alert(err.message),
    });
  }
}
