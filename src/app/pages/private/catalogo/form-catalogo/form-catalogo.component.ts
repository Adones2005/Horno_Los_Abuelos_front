import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { of, catchError } from 'rxjs';
import { PastelesService, Pastel } from
  '../../../../core/services/pasteles.service';
import { environment } from '../../../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-form-catalogo',
  templateUrl: './form-catalogo.component.html',
  styleUrls: ['./form-catalogo.component.scss'],
  imports: [NgIf, NgFor, AsyncPipe, CurrencyPipe, RouterLink],
})
export class FormCatalogoComponent implements OnInit {

  private pastelSvc = inject(PastelesService);

  readonly apiUrl = environment.apiUrl;
  pasteles$ = of<Pastel[]>([]);
  errorMsg  = '';

  ngOnInit() { this.load(); }

  load() {
    this.pasteles$ = this.pastelSvc.getAll().pipe(
      catchError(err => { this.errorMsg = err.message; return of([]); })
    );
  }

  /** swal de borrado (ya con SweetAlert2) */
  eliminar(id: number) {
    import('sweetalert2').then(({ default: Swal }) => {
      Swal.fire({
        title: '¿Eliminar pastel?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e63946',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      }).then(r => {
        if (!r.isConfirmed) return;
        this.pastelSvc.delete(id).subscribe({
          next: () => {
            this.load();
            Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500,
                        showConfirmButton: false });
          },
          error: err =>
            Swal.fire('Error', err.message ?? 'No se pudo borrar', 'error'),
        });
      });
    });
  }
}
