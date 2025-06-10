import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Ruta {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class RutasService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(`${this.apiUrl}/rutas`);
  }
}
