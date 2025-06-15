import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  /* ────────── página principal ────────── */
  {
    path: '',
    loadComponent: () =>
      import('./pages/public/home/home.component')
        .then(m => m.HomeComponent),
  },

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
    canActivate: [roleGuard(['gestor', 'comercial', 'repartidor'])],
    loadComponent: () =>
      import('./pages/private/control-panel/control-panel.component')
        .then(m => m.ControlPanelComponent),

    /* ───── hijos directos del panel ───── */
    children: [
      /* Clientes */
      {
        path: 'clientes',
        canActivate: [roleGuard(['comercial'])],
        loadComponent: () =>
          import('./pages/private/clientes/clientes.component')
            .then(m => m.ClientesComponent),
      },
      {
        path: 'clientes/nuevo',
        canActivate: [roleGuard(['comercial'])],
        loadComponent: () =>
          import('./pages/private/clientes/form/cliente-form.component')
            .then(m => m.ClienteFormComponent),
      },
      {
        path: 'clientes/:id',
        canActivate: [roleGuard(['comercial'])],
        loadComponent: () =>
          import('./pages/private/clientes/form/cliente-form.component')
            .then(m => m.ClienteFormComponent),
      },

      /* Direcciones */
      {
        path: 'direcciones',
        canActivate: [roleGuard(['comercial'])],
        loadComponent: () =>
          import('./pages/private/direcciones/direcciones.component')
            .then(m => m.DireccionesComponent),
      },
      {
        path: 'direcciones/nuevo',
        canActivate: [roleGuard(['comercial'])],
        loadComponent: () =>
          import('./pages/private/direcciones/form/direccion-form.component')
            .then(m => m.DireccionFormComponent),
      },
      {
        path: 'direcciones/:id',
        canActivate: [roleGuard(['comercial'])],
        loadComponent: () =>
          import('./pages/private/direcciones/form/direccion-form.component')
            .then(m => m.DireccionFormComponent),
      },

      /* Catálogo interno */
      {
        path: 'catalogo-interno',
        canActivate: [roleGuard(['gestor'])],
        loadComponent: () =>
          import('./pages/private/catalogo/catalogo.component')
            .then(m => m.CatalogoComponent),
      },
      {
        path: 'catalogo-interno/nuevo',
        canActivate: [roleGuard(['gestor'])],
        loadComponent: () =>
          import('./pages/private/catalogo/form-catalogo/form-catalogo.component')
            .then(m => m.FormCatalogoComponent),
      },
      {
        path: 'catalogo-interno/editar/:id',
        canActivate: [roleGuard(['gestor'])],
        loadComponent: () =>
          import('./pages/private/catalogo/form-catalogo/form-catalogo.component')
            .then(m => m.FormCatalogoComponent),
      },

      /* Empleados y autorización */
      {
        path: 'empleados',
        canActivate: [roleGuard(['gestor'])],
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
        path: 'pedidos/nuevo',
        loadComponent: () =>
          import('./pages/private/pedidos/pedido-form/pedido-form.component')
            .then(m => m.PedidoFormComponent),
      },
      /* Reparto diario */
      {
        path: 'repartos',
        canActivate: [() =>
          import('./core/guards/repartidor.guard')
            .then(m => m.repartidorGuard)
        ],
        loadComponent: () =>
          import('./pages/private/repartos/repartos.component')
            .then(m => m.RepartosComponent),
      },

      {
        path: 'pedidos/detalle/:id',
        loadComponent: () =>
          import('./pages/private/detalle-pedido/detalle-pedido.component')
            .then(m => m.DetallePedidoComponent),
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
