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
}
