// src/app/core/services/clientes.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Cliente {
  id:        number;
  nombre:    string;
  email:     string;
  telefono:  string;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /** GET /clientes */
  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
  }

  /** GET /clientes/{id} */
  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/clientes/${id}`);
  }

  /** POST /clientes */
  create(dto: Cliente) {
    return this.http.post(`${this.apiUrl}/clientes`, dto);
  }

  /** PUT /clientes/{id} */
  update(id: number, dto: Cliente) {
    return this.http.put(`${this.apiUrl}/clientes/${id}`, dto);
  }

  /** DELETE /clientes/{id} */
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/clientes/${id}`);
  }

  // core/services/clientes.service.ts
  getNombre(id: number) { return this.http.get<{nombre:string}>(`${this.apiUrl}/clientes/${id}`); }




}
