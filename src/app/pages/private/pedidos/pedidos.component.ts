/* ──────────────────────────────────────────────────────────────
 *  PedidosComponent  –  lista responsive de pedidos
 * ──────────────────────────────────────────────────────────── */
import { Component, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgFor } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { PedidosService } from '../../../core/services/pedido.service';
import { ClientesService } from '../../../core/services/cliente.service';
import { DireccionesService } from '../../../core/services/direcciones.service';
import { EmpleadosService } from '../../../core/services/empleados.service';
import { PedidoEstadoPipe } from '../../../shared/pedido-estado.pipe';
import Swal from 'sweetalert2';
import e from 'express';

/* ── modelos ─────────────────────────────────────────────── */
interface PedidoRaw {
  id: number;
  cliente:   { id: number };
  direccion: { id: number };
  empleado?: { id: number } | null;
  estado: 0 | 1 | 2;
}
interface ItemNombre { id:number; nombre:string; }
interface ItemTexto  { id:number; texto:string; }

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

  /* inyecciones */
  private pedidosSvc  = inject(PedidosService);
  private clientesSvc = inject(ClientesService);
  private dirSvc      = inject(DireccionesService);
  private empSvc      = inject(EmpleadosService);

  /* stream final */
  pedidos$: Observable<PedidoVM[]> = of([]);
  /* ui */
  errorMsg = '';
  filtro   = -1;

  ngOnInit() { this.load(); }

  private load(): void {
  console.log("Cargando pedidos...");
  this.pedidos$ = combineLatest([
    this.pedidosSvc.getAll(),
    this.clientesSvc.getAll(),
    this.dirSvc.getAllTextos(),
    this.empSvc.activos(),
  ]).pipe(
    map(([peds, cli, dir, emp]) => {
      console.log("Pedidos recibidos:", peds);
      console.log("Clientes recibidos:", cli);
      console.log("Direcciones recibidas:", dir);
      console.log("Empleados recibidos:", emp);

      const cMap = new Map(cli.map(c => [c.id, c.nombre]));
      const dMap = new Map(dir.map(d => [d.id, d.calle]));
      const eMap = new Map(emp.map(e => [e.id, e.nombre]));


      return peds.map(p => ({
        id        : p.id,
        cliente   : cMap.get(p.cliente)   ?? '—',
        direccion : dMap.get(p.direccion) ?? '—',
        empleado  : p.empleado ? eMap.get(p.empleado) ?? null : null,
        estado    : p.estado,
      })) as PedidoVM[];
    }),
    catchError(err => {
      this.errorMsg = err.message;
      console.error("Error al cargar los datos:", err);
      return of([]);
    })
  );
}


  /**
   * Elimina un pedido por su ID tras confirmación y vuelve a cargar la lista.
   */
  eliminar(id: number): void {
    Swal.fire({
      title: `¿Eliminar pedido #${id}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        this.pedidosSvc.delete(id).pipe(
          catchError(err => {
            Swal.fire('Error', err.message, 'error');
            return of(null);
          })
        ).subscribe(res => {
          if (res !== null) {
            Swal.fire('Eliminado', 'El pedido ha sido eliminado.', 'success');
            this.load();
          }
        });
      }
    });
  
    this.pedidosSvc.delete(id).pipe(
      // tras borrar, recargamos
      switchMap(() => {
        this.errorMsg = '';
        return this.pedidosSvc.getAll();
      }),
      // mapeamos de nuevo al VM para mantener consistencia
      switchMap(pedsRaw =>
        combineLatest([
          of(pedsRaw),
          this.clientesSvc.getAll(),
          this.dirSvc.getAllTextos(),
          this.empSvc.activos(),
        ])
      ),
      map(([peds, cli, dir, emp]) => {
        const cMap = new Map(cli.map(c => [c.id, c.nombre]));
        const dMap = new Map(dir.map(d => [d.id, d.calle]));
        const eMap = new Map(emp.map(e => [e.id, e.nombre]));
        return peds.map(p => ({
          id        : p.id,
          cliente   : cMap.get(p.cliente)   ?? '—',
          direccion : dMap.get(p.direccion) ?? '—',
          empleado  : p.empleado ? eMap.get(p.empleado) ?? null : null,
          estado    : p.estado,
        })) as PedidoVM[];
      }),
      catchError(err => {
        this.errorMsg = err.message;
        return of([]);
      })
    ).subscribe(vms => {
      // actualizamos el observable manualmente
      this.pedidos$ = of(vms);
    });
  }

  /* helpers css */
  badge(e:0|1|2){
    return {
      'rounded-full px-2 py-0.5 text-xs': true,
      'bg-gray-200 text-gray-700': e === 0,
      'bg-amber-200 text-amber-700': e === 1,
      'bg-green-200 text-green-700': e === 2,
    };
  }
  label(e:0|1|2) {
    return ['Creado','Confirmado','Entregado'][e];
  }
}
