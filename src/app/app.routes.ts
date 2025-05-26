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
   {
    path: 'control-panel',
    loadComponent: () =>
      import('./pages/private/control-panel/control-panel.component').then(
        m => m.ControlPanelComponent
      ),
    children: [
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/private/clientes/clientes.component').then(
            m => m.ClientesComponent
          ),
      },
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
    ],
  },
];
