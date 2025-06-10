// src/app/core/services/empleados.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface DireccionTexto { id: number; calle: string; }

export interface Direccion {
  id: number;
  calle: string;
  ciudad: string;
  codigoPostal: string;
  rutaId: number;
  clienteId: number;
}

@Injectable({ providedIn: 'root' })
export class DireccionesService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;  

  constructor() { }

  getTexto(id: number) {
     return this.http.get<{calle:string}>(`${this.apiUrl}/direcciones/${id}`);
     }

  getAllTextos(): Observable<DireccionTexto[]> {
    return this.http.get<DireccionTexto[]>(`${this.apiUrl}/direcciones`);
  }

  /* ========== CRUD completo ========== */

  getAll(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(`${this.apiUrl}/direcciones`);
  }

  getById(id: number): Observable<Direccion> {
    return this.http.get<Direccion>(`${this.apiUrl}/direcciones/${id}`);
  }

  create(dto: Omit<Direccion, 'id'>) {
    return this.http.post(`${this.apiUrl}/direcciones`, dto);
  }

  update(id: number, dto: Omit<Direccion, 'id'>) {
    return this.http.put(`${this.apiUrl}/direcciones/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/direcciones/${id}`);
  }
}
