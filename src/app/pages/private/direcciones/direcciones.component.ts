import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { DireccionesService, Direccion } from '../../../core/services/direcciones.service';
import { ClientesService } from '../../../core/services/cliente.service';
import { RutasService } from '../../../core/services/rutas.service';
import { catchError, combineLatest, map, of, Observable } from 'rxjs';



interface DireccionRow {
  id: number;
  calle: string;
  ciudad: string;
  codigoPostal: string;
  ruta: string;
  cliente: string;
}
@Component({
  selector: 'app-direcciones',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, PageTitleComponent],
  templateUrl: './direcciones.component.html',
})
export class DireccionesComponent implements OnInit {
  private dirSvc = inject(DireccionesService);
  private clienteSvc = inject(ClientesService);
  private rutasSvc = inject(RutasService);
  private router = inject(Router);

  direcciones$: Observable<DireccionRow[]> = of([]);
  errorMsg = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.direcciones$ = combineLatest([
      this.dirSvc.getAll(),
      this.rutasSvc.getAll(),
      this.clienteSvc.getAll(),
    ]).pipe(
      map(([dirs, rutas, clientes]) => {
        const rMap = new Map(rutas.map(r => [r.id, r.nombre]));
        const cMap = new Map(clientes.map(c => [c.id, c.nombre]));
        return dirs.map(d => ({
          id: d.id,
          calle: d.calle,
          ciudad: d.ciudad,
          codigoPostal: d.codigoPostal,
          ruta: rMap.get(d.rutaId) ?? '—',
          cliente: cMap.get(d.clienteId) ?? '—',
        }));
      }),
      catchError(err => {
        this.errorMsg = err.message ?? 'Error al cargar direcciones';
        return of([]);
      })
    );
  }

  nuevo(): void {
    this.router.navigateByUrl('/control-panel/direcciones/nuevo');
  }

  editar(d: DireccionRow): void {
    this.router.navigateByUrl(`/control-panel/direcciones/${d.id}`);
  }

  borrarConfirm(d: DireccionRow): void {
    if (!confirm(`¿Borrar la dirección "${d.calle}"?`)) return;
    this.dirSvc.delete(d.id).subscribe({
      next: () => this.load(),
      error: err => alert(err.message),
    });
  }
}
