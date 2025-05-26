/* src/app/layout/header/header.component.ts */
import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { LoginService } from '../../core/services/login.service';   

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,     
    RouterModule,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  /* ---------- estado del menú móvil ---------- */
  menuOpen = false;
  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }

  /* ---------- inyección de servicios ---------- */
  private loginSvc = inject(LoginService);
  private router   = inject(Router);

  /* Stream reactivo para saber si hay sesión */
  loggedIn$ = this.loginSvc.loggedIn$;

  /* ---------- logout ---------- */
  logout(): void {
    this.loginSvc.logout();
    this.router.navigateByUrl('/');      // vuelve a la home
  }
}
