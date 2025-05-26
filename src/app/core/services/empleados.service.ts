// src/app/core/services/empleados.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Empleado {
  id:       number;
  nombre:   string;
  username: string;
  email:    string;
  password?: string;  // opcional al listar
  rolId:    number;
  estado:   number;   // 0 pendiente · 1 activo
}
@Injectable({ providedIn: 'root' })
export class EmpleadosService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;        

  /* ---------- Alta ---------- */
  create(dto: Empleado): Observable<any> {
    return this.http.post(`${this.apiUrl}/empleados`, dto);
  }

  /* ---------- Listados ---------- */
  /** GET activos (estado = 1) */
  activos(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.apiUrl}/empleados/activos`);
  }

  /** GET pendientes/desactivados (estado = 0) */
  pendientes(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.apiUrl}/empleados/desactivados`);
  }

   /** PATCH /empleados/{id}  — estado ← 1 (activar) */
  activar(id: number) {
    return this.http.patch(`${this.apiUrl}/empleados/${id}/estado`, { estado: 1 });
  }

  /** PATCH /empleados/{id}  — estado ← 0 (desactivar) */
  desactivar(id: number) {
    return this.http.patch(`${this.apiUrl}/empleados/${id}/estado`, { estado: 0 });
  }

    /* core/services/empleados.service.ts */
  delete(id: number) {
    return this.http.request('delete', `${this.apiUrl}/empleados/${id}`);
}

}

