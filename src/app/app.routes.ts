import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'identificarse', pathMatch: 'full' },

  /* ─────── Públicas ─────── */
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
    path: 'catalogo',
    loadComponent: () =>
      import('./pages/public/catalogo/catalogo.component').then(
        m => m.CatalogoComponent
      ),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./pages/public/contact/contact.component').then(
        m => m.ContactComponent
      ),
  },

  /* ─────── Privadas (PANEL) ─────── */
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
      {
        path: 'clientes/nuevo',
        loadComponent: () =>
          import('./pages/private/clientes/form/cliente-form.component').then(
            m => m.ClienteFormComponent
          ),
      },
      {
        path: 'clientes/:id',
        loadComponent: () =>
          import('./pages/private/clientes/form/cliente-form.component').then(
            m => m.ClienteFormComponent
          ),
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./pages/private/empleados/empleados.component').then(
            m => m.EmpleadosComponent
          ),
      },
      {
        path: 'aceptar-usuarios',
        loadComponent: () =>
          import('./pages/private/aceptar-usuarios/aceptar-usuarios.component').then(
            m => m.AceptarUsuariosComponent
          ),
      },
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
    ],
  },
];
