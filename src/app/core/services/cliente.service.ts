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


}
