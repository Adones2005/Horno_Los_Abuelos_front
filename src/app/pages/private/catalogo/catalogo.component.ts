import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { PageTitleComponent } from '../../shared/page-title/page-title.component';
import { PastelesService, Pastel } from '../../../core/services/pasteles.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, CurrencyPipe, PageTitleComponent],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent implements OnInit {
  private pastelSvc = inject(PastelesService);
  private router = inject(Router);

  pasteles$ = of<Pastel[]>([]);
  errorMsg = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.pasteles$ = this.pastelSvc.getAll().pipe(
      catchError(err => {
        this.errorMsg = err.message ?? 'Error al cargar pasteles';
        return of([]);
      })
    );
  }

  nuevo(): void {
    this.router.navigateByUrl('/control-panel/catalogo/nuevo');
  }

  editar(p: Pastel): void {
    this.router.navigateByUrl(`/control-panel/catalogo/${p.id}`);
  }

  borrarConfirm(p: Pastel): void {
    if (!confirm(`¿Borrar ${p.nombre}?`)) return;
    this.pastelSvc.delete(p.id).subscribe({
      next: () => this.load(),
      error: err => (this.errorMsg = err.message ?? 'Error al borrar'),
    });
  }
}
