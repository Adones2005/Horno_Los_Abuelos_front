// src/app/core/services/empleados.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface DireccionTexto { id: number; calle: string; }

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
}
