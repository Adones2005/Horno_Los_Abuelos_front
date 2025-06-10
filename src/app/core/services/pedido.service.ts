import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/* ────────── Modelos que usa el front ────────── */
export interface Pedido {
  id:        number;
  cliente:   { id: number; nombre: string };
  direccion: { id: number; texto:  string };
  empleado?: { id: number; nombre: string } | null;
  estado:    0 | 1 | 2;                       // 0=creado · 1=confirmado · 2=entregado
}

/** Vista simplificada para la tabla / cards */
export interface PedidoVM {
  clienteId(clienteId: any): string;
  id:        number;
  cliente:   number;
  direccion: number;
  empleado?: number | null;
  estado:    0 | 1 | 2;
}


export interface PedidoPastel {
  pastel:   { id: number; nombre: string; imagen: string };
  cantidad: number;
}


/* ────────── Servicio ────────── */
@Injectable({ providedIn: 'root' })
export class PedidosService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;         // http://localhost:8080/api

  /* ========== READ ========== */

  /** Lista todos los pedidos  */
  getAll(): Observable<PedidoVM[]> {
    return this.http.get<PedidoVM[]>(`${this.apiUrl}/pedidos`);
  }

  /** Obtiene un pedido concreto */
  getOne(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedidos/${id}`);
  }

   /** Lista los pasteles de un pedido */
  getPasteles(id: number): Observable<PedidoPastel[]> {
    return this.http.get<PedidoPastel[]>(`${this.apiUrl}/pedidos-pasteles/pedido/${id}`);
  }

  /* ========== UPDATE ========== */

  /**
   * Cambia estado y/o empleado.
   * – Solo envía los campos que hayas tocado.
   */
  update(
    id: number,
    payload: { estado?: 0 | 1 | 2; empleadoId?: number | null }
  ): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/pedidos/${id}`, payload);
  }

  /* Atajos cómodos (úsalos si lo prefieres) */
  confirmar(id: number)  { return this.update(id, { estado: 1 }); }
  entregar(id: number)   { return this.update(id, { estado: 2 }); }
  asignar(id: number, empleadoId: number | null) {
    return this.update(id, { empleadoId });
  }

  /* ========== DELETE opcional ========== */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pedidos/${id}`);
  }

   create(dto: {
    clienteId: number;
    direccionId: number;
    items: { pastelId: number; cantidad: number }[];
  }): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/pedidos`, dto);
  }

}
