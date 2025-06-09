
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


export interface Pastel {
  id:     number;
  nombre: string;
  precio: number; 
  imagen: string;       
  especificaciones?: number[];  
}


export interface PastelForm {
  nombre: string;
  precio: number;        
  imagen: File | null;        
  especificaciones?: number[]; 
}

@Injectable({ providedIn: 'root' })
export class PastelesService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl; // http://localhost:8080/api

  /* ──────────────── READ ──────────────── */
  getAll(): Observable<Pastel[]> {
    return this.http.get<Pastel[]>(`${this.apiUrl}/pasteles`);
  }

  
  /** Obtiene un pastel por id (para editar) */
  getOne(id: number): Observable<Pastel> {
    return this.http.get<Pastel>(`${this.apiUrl}/pasteles/${id}`);
  }

  /* ──────────────── CREATE ─────────────── */
  create(dto: PastelForm): Observable<Pastel> {
    const body = this.toFormData(dto);
    return this.http.post<Pastel>(`${this.apiUrl}/pasteles`, body);
  }

  /* ──────────────── UPDATE ─────────────── */
  update(id: number, dto: PastelForm): Observable<Pastel> {
    const body = this.toFormData(dto);
    return this.http.put<Pastel>(`${this.apiUrl}/pasteles/${id}`, body);
  }

  /* ──────────────── DELETE ─────────────── */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pasteles/${id}`);
  }

  /* ---------- helper: convierte a FormData ---------- */
  private toFormData(dto: PastelForm): FormData {
    const fd = new FormData();
    fd.append('nombre', dto.nombre);
    fd.append('precio', dto.precio.toString());

    if (dto.imagen) {
      fd.append('imagen', dto.imagen);    
    }

    if (dto.especificaciones?.length) {
      dto.especificaciones.forEach(id =>
        fd.append('especificaciones', id.toString())
      );
    }

    return fd;
  }
}
