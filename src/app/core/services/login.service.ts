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
  expiresIn: number;       // (segundos) opcional, pero lo trae tu backend
  refreshToken?: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private apiUrl     = environment.apiUrl;

  /* ——— helpers ——— */
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private decodePayload(token: string): any | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
  }

  private decodeRole(token: string): string | null {
    const p = this.decodePayload(token);
    if (!p || !p.roles) return null;
    const raw = Array.isArray(p.roles) ? p.roles[0] : p.roles;
    return raw ? raw.replace(/^ROLE_/i, '').toLowerCase() : null;
  }

  private isExpired(token: string): boolean {
    const p = this.decodePayload(token);
    return !p || (p.exp ?? 0) * 1000 <= Date.now();
  }

  /* ——— estado reactivo ——— */
  private _loggedIn = new BehaviorSubject<boolean>(this.hasValidToken());
  loggedIn$ = this._loggedIn.asObservable();

  private _role = new BehaviorSubject<string | null>(this.initialRole());
  role$ = this._role.asObservable();

  private logoutTimer: any;  // NodeJS.Timeout | number

  /* ——— login ——— */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/authenticate`, credentials)
      .pipe(
        tap(res => this.storeTokens(res)),
        catchError(this.handleError)
      );
  }

  /* ——— logout ——— */
  logout(): void {
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    this._loggedIn.next(false);
    this._role.next(null);
  }

  /* ——— helpers internos ——— */
  private storeTokens({ token, refreshToken }: AuthResponse): void {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      /* programa auto-logout */
      const p = this.decodePayload(token);
      if (p?.exp) {
        const ms = p.exp * 1000 - Date.now();
        if (ms > 0) {
          if (this.logoutTimer) clearTimeout(this.logoutTimer);
          this.logoutTimer = setTimeout(() => this.logout(), ms);
        }
      }

      this._role.next(this.decodeRole(token));
    }
    this._loggedIn.next(true);
  }

  /** true si hay token Y no está expirado */
  private hasValidToken(): boolean {
    if (!this.isBrowser()) return false;
    const tok = localStorage.getItem('token');
    if (!tok || this.isExpired(tok)) {
      if (tok) this.logout();          // token caducado → limpiar sesión
      return false;
    }
    return true;
  }

  private initialRole(): string | null {
    if (!this.isBrowser()) return null;
    const tok = localStorage.getItem('token');
    return tok && !this.isExpired(tok) ? this.decodeRole(tok) : null;
  }

  /* ——— acceso directo al JWT ——— */
  get token(): string | null {
    return this.isBrowser() && !this.isExpired(localStorage.getItem('token') || '')
      ? localStorage.getItem('token')
      : null;
  }

  private handleError(error: HttpErrorResponse) {
    const msg =
      error.status === 0
        ? 'No se pudo conectar con el servidor.'
        : error.error?.message ?? 'Credenciales inválidas';
    return throwError(() => new Error(msg));
  }
}
