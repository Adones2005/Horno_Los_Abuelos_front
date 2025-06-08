// src/app/pages/private/clientes/clientes.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { PageTitleComponent } from '../../shared/page-title/page-title.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ClientesService, Cliente } from '../../../core/services/cliente.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, PageTitleComponent],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  private clienteSvc = inject(ClientesService);
  private router = inject(Router);

  clientes$ = of<Cliente[]>([]);
  errorMsg = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.clientes$ = this.clienteSvc.getAll().pipe(
      catchError(err => {
        this.errorMsg = err.message ?? 'Error al cargar clientes';
        return of([]);
      })
    );
  }

  nuevo(): void {
    this.router.navigateByUrl('/control-panel/clientes/nuevo');
  }

  editar(c: Cliente): void {
    this.router.navigateByUrl(`/control-panel/clientes/${c.id}`);
  }

  async borrarConfirm(c: Cliente): Promise<void> {
    const ok = await Swal.fire({
      title: `¿Borrar a ${c.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    });
    if (!ok.isConfirmed) return;
    this.clienteSvc.delete(c.id).subscribe({
      next: () => { Swal.fire('Borrado', '', 'success'); this.load(); },
      error: err => Swal.fire('Error', err.message, 'error'),
    });
  }
}
