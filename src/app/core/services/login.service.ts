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
  token: string;
  expiresIn: number;
  refreshToken?: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl     = environment.apiUrl;

  /* ---------- helpers ---------- */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private decodeRole(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // tu backend pone roles=["ROLE_gestor"], coge el primero sin el prefijo
      const raw = Array.isArray(payload.roles) ? payload.roles[0] : payload.roles;
      return raw ? raw.replace(/^ROLE_/i, '').toLowerCase() : null;
    } catch {
      return null;
    }
  }

  /* ---------- estado reactivo ---------- */
  private _loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this._loggedIn.asObservable();

  private _role = new BehaviorSubject<string | null>(this.initialRole());
  role$ = this._role.asObservable();

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
    this._role.next(null);
  }

  /* ---------- helpers ---------- */
  private storeTokens({ token, refreshToken }: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      this._role.next(this.decodeRole(token));
    }
    this._loggedIn.next(true);
  }

  private hasToken(): boolean {
    return this.isBrowser() && !!localStorage.getItem('token');
  }

  private initialRole(): string | null {
    if (!this.isBrowser()) return null;
    const stored = localStorage.getItem('token');
    return stored ? this.decodeRole(stored) : null;
  }

  /** acceso directo */
  get token(): string | null {
    return this.isBrowser() ? localStorage.getItem('token') : null;
  }

  private handleError(error: HttpErrorResponse) {
    const msg = error.status === 0
      ? 'No se pudo conectar con el servidor.'
      : error.error?.message ?? 'Credenciales inválidas';
    return throwError(() => new Error(msg));
  }
}
