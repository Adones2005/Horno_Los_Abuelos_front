// src/app/core/services/login.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;          // JWT
  expiresIn: number;      // segundos
  refreshToken?: string;  // opcional
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl ?? ''; 

  /** Hace login y devuelve el JWT */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials)
      .pipe(
        tap(res => this.storeToken(res)), // guarda el token en localStorage
        catchError(this.handleError)
      );
  }

  /** Guarda token (y refresh token) de forma sencilla en localStorage */
  private storeToken({ token, refreshToken }: AuthResponse): void {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /** Devuelve el token si existe */
  get token(): string | null {
    return localStorage.getItem('token');
  }

  /** Elimina credenciales (logout) */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  /** Manejo simple de errores */
  private handleError(error: HttpErrorResponse) {
    const msg =
      error.status === 0
        ? 'No se pudo conectar con el servidor.'
        : error.error?.message ?? 'Credenciales inválidas';
    return throwError(() => new Error(msg));
  }
}
