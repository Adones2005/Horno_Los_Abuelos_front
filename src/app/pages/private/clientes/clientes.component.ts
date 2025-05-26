// src/app/pages/private/clientes/clientes.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { ClientesService, Cliente } from '../../../core/services/cliente.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  private clienteSvc = inject(ClientesService);

  clientes$ = of<Cliente[]>([]);
  errorMsg = '';

  ngOnInit(): void {
    this.clientes$ = this.clienteSvc.getAll().pipe(
      catchError(err => {
        this.errorMsg = err.message ?? 'Error al cargar clientes';
        return of([]);
      })
    );
  }
}
