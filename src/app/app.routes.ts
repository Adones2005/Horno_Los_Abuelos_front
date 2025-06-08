// src/app/routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'identificarse', pathMatch: 'full' },
  {
    path: 'identificarse',         
    loadComponent: () =>
      import('./pages/public/login/login.component').then(
        m => m.LoginComponent
      ),
  },
  {
    path: 'registrar',
    loadComponent: () =>
      import('./pages/public/registrar/registrar.component').then(
        m => m.RegistrarComponent
      ),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./pages/public/contact/contact.component').then(
        m => m.ContactComponent
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
      {
        path: 'empleados',
        loadComponent: () =>
          import('./pages/private/empleados/empleados.component')
            .then(m => m.EmpleadosComponent),
      },
      {
        path: 'aceptar-usuarios',
        loadComponent: () =>
          import('./pages/private/aceptar-usuarios/aceptar-usuarios.component')
            .then(m => m.AceptarUsuariosComponent),
      },
    ],
  },
];
