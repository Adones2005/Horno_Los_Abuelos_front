// src/app/core/services/login.service.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;         // JWT
  expiresIn: number;     // segundos (opcional)
  refreshToken?: string; // opcional
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl     = environment.apiUrl;      

  /* --- helpers para saber si estamos en el navegador --- */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /* --- estado reactivo de autenticación --- */
  private _loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this._loggedIn.asObservable();

  /* ---------- login ---------- */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials)
      .pipe(
        tap(res => this.storeTokens(res)),
        catchError(this.handleError)
      );
  }

  /* ---------- logout ---------- */
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    this._loggedIn.next(false);
  }

  /* ---------- helpers ---------- */

  private storeTokens({ token, refreshToken }: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
    this._loggedIn.next(true);
  }

  private hasToken(): boolean {
    return this.isBrowser() && !!localStorage.getItem('token');
  }

  /** Acceso directo al JWT (solo en navegador) */
  get token(): string | null {
    return this.isBrowser() ? localStorage.getItem('token') : null;
  }

  private handleError(error: HttpErrorResponse) {
    const msg =
      error.status === 0
        ? 'No se pudo conectar con el servidor.'
        : error.error?.message ?? 'Credenciales inválidas';
    return throwError(() => new Error(msg));
  }
}
