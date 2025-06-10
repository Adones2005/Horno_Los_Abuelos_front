/* ──────────────────────────────────────────────────────────────
 *  PedidosComponent  –  lista responsive de pedidos
 * ──────────────────────────────────────────────────────────── */
import { Component, OnInit, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { NgFor } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs';
import { catchError } from 'rxjs';

import { PedidosService } from '../../../core/services/pedido.service';
import { ClientesService } from '../../../core/services/cliente.service';
import { DireccionesService } from '../../../core/services/direcciones.service';
import { EmpleadosService } from '../../../core/services/empleados.service';
import { PedidoEstadoPipe } from '../../../shared/pedido-estado.pipe';

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
    this.pedidos$ = combineLatest([
      this.pedidosSvc.getAll(),              
      this.clientesSvc.getAll(),      
      this.dirSvc.getAllTextos(),          
      this.empSvc.activos(),         
    ]).pipe(
      map(([peds, cli, dir, emp]) => {
        const cMap = new Map(cli.map(c => [c.id, c.nombre]));
        const dMap = new Map(dir.map(d => [d.id, d.texto]));
        const eMap = new Map(emp.map(e => [e.id, e.nombre]));

        return peds.map(p => ({
          id        : p.id,
          cliente   : cMap.get(p.cliente)   ?? '—',
          direccion : dMap.get(p.direccion) ?? '—',
          empleado  : p.empleado ? eMap.get(p.empleado) ?? null : null,
          estado    : p.estado,
        })) as PedidoVM[];
      }),
      catchError(err => { this.errorMsg = err.message; return of([]); })
    );
  }

  /* helpers css */
  badge(e:0|1|2){
    return {'rounded-full px-2 py-0.5 text-xs':true,
            'bg-gray-200 text-gray-700':e===0,
            'bg-amber-200 text-amber-700':e===1,
            'bg-green-200 text-green-700':e===2};
  }
  label(e:0|1|2){return ['Creado','Confirmado','Entregado'][e];}
}
