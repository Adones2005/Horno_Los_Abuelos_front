import { Routes } from '@angular/router';

export const routes: Routes = [
  /* ────────── redirect raíz ────────── */
  { path: '', redirectTo: 'identificarse', pathMatch: 'full' },

  /* ────────── públicas ────────── */
  {
    path: 'identificarse',
    loadComponent: () =>
      import('./pages/public/login/login.component')
        .then(m => m.LoginComponent),
  },
  {
    path: 'registrar',
    loadComponent: () =>
      import('./pages/public/registrar/registrar.component')
        .then(m => m.RegistrarComponent),
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./pages/public/catalogo/catalogo.component')
        .then(m => m.CatalogoComponent),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./pages/public/contact/contact.component')
        .then(m => m.ContactComponent),
  },

  /* ────────── privadas (Panel) ────────── */
  {
    path: 'control-panel',
    loadComponent: () =>
      import('./pages/private/control-panel/control-panel.component')
        .then(m => m.ControlPanelComponent),

    /* ───── hijos directos del panel ───── */
    children: [
      /* Clientes */
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/private/clientes/clientes.component')
            .then(m => m.ClientesComponent),
      },
      {
        path: 'clientes/nuevo',
        loadComponent: () =>
          import('./pages/private/clientes/form/cliente-form.component')
            .then(m => m.ClienteFormComponent),
      },
      {
        path: 'clientes/:id',
        loadComponent: () =>
          import('./pages/private/clientes/form/cliente-form.component')
            .then(m => m.ClienteFormComponent),
      },

      /* Direcciones */
      {
        path: 'direcciones',
        loadComponent: () =>
          import('./pages/private/direcciones/direcciones.component')
            .then(m => m.DireccionesComponent),
      },
      {
        path: 'direcciones/nuevo',
        loadComponent: () =>
          import('./pages/private/direcciones/form/direccion-form.component')
            .then(m => m.DireccionFormComponent),
      },
      {
        path: 'direcciones/:id',
        loadComponent: () =>
          import('./pages/private/direcciones/form/direccion-form.component')
            .then(m => m.DireccionFormComponent),
      },

      /* Catálogo interno */
      {
        path: 'catalogo-interno',
        loadComponent: () =>
          import('./pages/private/catalogo/catalogo.component')
            .then(m => m.CatalogoComponent),
      },
      {
        path: 'catalogo-interno/nuevo',
        loadComponent: () =>
          import('./pages/private/catalogo/form-catalogo/form-catalogo.component')
            .then(m => m.FormCatalogoComponent),
      },
      {
        path: 'catalogo-interno/editar/:id',
        loadComponent: () =>
          import('./pages/private/catalogo/form-catalogo/form-catalogo.component')
            .then(m => m.FormCatalogoComponent),
      },

      /* Empleados y autorización */
      {
        path: 'empleados',
        loadComponent: () =>
          import('./pages/private/empleados/empleados.component')
            .then(m => m.EmpleadosComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pages/private/pedidos/pedidos.component')
            .then(m => m.PedidosComponent),
      },

      {
        path: 'aceptar-usuarios',
        loadComponent: () =>
          import('./pages/private/aceptar-usuarios/aceptar-usuarios.component')
            .then(m => m.AceptarUsuariosComponent),
      },

      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
    ],
  },
];
