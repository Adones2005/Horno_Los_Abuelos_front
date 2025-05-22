// src/app/routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [


  /* --------  Ruta para “Identifícate” (login)  -------- */
  {
    path: 'identificarse',         
    loadComponent: () =>
      import('./pages/public/login/login.component').then(
        m => m.LoginComponent
      ),
  },
];
