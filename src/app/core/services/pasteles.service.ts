// src/app/core/services/pasteles.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Pastel {
  id:       number;
  nombre:   string;
  precio:   number;    
  imagen:   string;  
}

@Injectable({ providedIn: 'root' })
export class PastelesService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;   // http://localhost:8080/api

  getAll(): Observable<Pastel[]> {
    return this.http.get<Pastel[]>(`${this.apiUrl}/pasteles`);
  }

  /** GET /pasteles/{id} */
  getById(id: number): Observable<Pastel> {
    return this.http.get<Pastel>(`${this.apiUrl}/pasteles/${id}`);
  }

  /** POST /pasteles */
  create(dto: Omit<Pastel, 'id'>) {
    return this.http.post(`${this.apiUrl}/pasteles`, dto);
  }

  /** PUT /pasteles/{id} */
  update(id: number, dto: Omit<Pastel, 'id'>) {
    return this.http.put(`${this.apiUrl}/pasteles/${id}`, dto);
  }

  /** DELETE /pasteles/{id} */
  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/pasteles/${id}`);
  }
}
