/* ──────────────────────────────────────────────────────────────
 *  PedidosComponent  –  lista responsive de pedidos
 * ──────────────────────────────────────────────────────────── */
import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, AsyncPipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { PedidosService } from '../../../core/services/pedido.service';
import { ClientesService } from '../../../core/services/cliente.service';
import { DireccionesService } from '../../../core/services/direcciones.service';
import { EmpleadosService } from '../../../core/services/empleados.service';
import { LoginService } from '../../../core/services/login.service';
import { PedidoEstadoPipe } from '../../../shared/pedido-estado.pipe';
import Swal from 'sweetalert2';

/* ── modelos ─────────────────────────────────────────────── */
interface PedidoRaw {
  id: number;
  clienteId: number;
  direccionId: number;
  empleadoId?: number | null;
  estado: 0 | 1 | 2;
}

interface ItemNombre { id: number; nombre: string; }
interface ItemTexto  { id: number; calle: string; }

interface PedidoVM {
  id: number;
  cliente: string;
  direccion: string;
  empleado: string | null;
  estado: 0 | 1 | 2;
}

@Component({
  standalone: true,
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  imports: [NgIf, NgFor, AsyncPipe, RouterLink, NgClass, PedidoEstadoPipe],
})
export class PedidosComponent implements OnInit {

  private pedidosSvc = inject(PedidosService);
  private clientesSvc = inject(ClientesService);
  private dirSvc = inject(DireccionesService);
  private empSvc = inject(EmpleadosService);
  private loginSvc = inject(LoginService);

  pedidos$: Observable<PedidoVM[]> = of([]);
  errorMsg = '';
  filtro = -1;
  role$ = this.loginSvc.role$;
  
   constructor(private router: Router) {}

  ngOnInit() {
    this.load();
  }

  private load(): void {
    this.pedidos$ = combineLatest([
      this.pedidosSvc.getAll() as unknown as Observable<PedidoRaw[]>,
      this.clientesSvc.getAll() as Observable<ItemNombre[]>,
      this.dirSvc.getAllTextos() as unknown as Observable<ItemTexto[]>,
      this.empSvc.activos() as Observable<ItemNombre[]>
    ]).pipe(
      map(([peds, cli, dir, emp]) => {
        const cMap = new Map<number, string>(cli.map(c => [c.id, c.nombre]));
        const dMap = new Map<number, string>(dir.map(d => [d.id, d.calle]));
        const eMap = new Map<number, string>(emp.map(e => [e.id, e.nombre]));

        return peds.map(p => ({
          id: p.id,
          cliente: cMap.get(p.clienteId) ?? '—',
          direccion: dMap.get(p.direccionId) ?? '—',
          empleado: p.empleadoId != null ? (eMap.get(p.empleadoId) ?? '—') : null,
          estado: p.estado,
        }));
      }),
      catchError(err => {
        this.errorMsg = err.message;
        return of([]);
      })
    );
  }

  eliminar(id: number): void {
    Swal.fire({
      title: `¿Eliminar pedido #${id}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (!result.isConfirmed) return;

      this.pedidosSvc.delete(id).pipe(
        catchError(err => {
          Swal.fire('Error', err.message, 'error');
          return of(null);
        }),
        switchMap(res => {
          if (res !== null) {
            Swal.fire('Eliminado', 'El pedido ha sido eliminado.', 'success');
          }
          this.errorMsg = '';
          return combineLatest([
            this.pedidosSvc.getAll() as unknown as Observable<PedidoRaw[]>,
            this.clientesSvc.getAll() as Observable<ItemNombre[]>,
            this.dirSvc.getAllTextos() as unknown as Observable<ItemTexto[]>,
            this.empSvc.activos() as Observable<ItemNombre[]>
          ]);
        }),
        map(([peds, cli, dir, emp]) => {
          const cMap = new Map<number, string>(cli.map(c => [c.id, c.nombre]));
          const dMap = new Map<number, string>(dir.map(d => [d.id, d.calle]));
          const eMap = new Map<number, string>(emp.map(e => [e.id, e.nombre]));

          return peds.map(p => ({
            id: p.id,
            cliente: cMap.get(p.clienteId) ?? '—',
            direccion: dMap.get(p.direccionId) ?? '—',
            empleado: p.empleadoId != null ? (eMap.get(p.empleadoId) ?? '—') : null,
            estado: p.estado,
          }));
        }),
        catchError(err => {
          this.errorMsg = err.message;
          return of([]);
        })
      ).subscribe(vms => this.pedidos$ = of(vms));
    });
  }

  confirmar(id: number): void {
    Swal.fire({
      title: `¿Confirmar pedido #${id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (!result.isConfirmed) return;
      this.pedidosSvc.confirmar(id).subscribe({
        next: () => { Swal.fire('Confirmado', '', 'success'); this.load(); },
        error: err => Swal.fire('Error', err.message, 'error'),
      });
    });
  }

  irDetalle(id: number) {
    this.router.navigate(['/control-panel/pedidos/detalle/', id]);
  }

   nuevo() {
    this.router.navigateByUrl('/control-panel/pedidos/nuevo');
  }

  badge(e: 0 | 1 | 2) {
    return {
      'rounded-full px-2 py-0.5 text-xs': true,
      'bg-gray-200 text-gray-700': e === 0,
      'bg-amber-200 text-amber-700': e === 1,
      'bg-green-200 text-green-700': e === 2,
    };
  }

  label(e: 0 | 1 | 2) {
    return ['Creado', 'Confirmado', 'Entregado'][e];
  }
}
