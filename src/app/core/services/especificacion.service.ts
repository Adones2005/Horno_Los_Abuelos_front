// core/services/especificaciones.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Especificacion {
  id:   number;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class EspecificacionesService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Especificacion[]> {
    return this.http.get<Especificacion[]>(`${this.apiUrl}/especificaciones`);
  }
}
