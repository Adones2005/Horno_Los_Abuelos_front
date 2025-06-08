import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { catchError, of } from 'rxjs';
import { PastelesService, Pastel } from '../../../core/services/pasteles.service';
import { environment } from '../../../../environments/environment';


@Component({
  standalone: true,
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  imports: [NgIf, NgFor, AsyncPipe, CurrencyPipe, PageTitleComponent],
})
export class CatalogoComponent implements OnInit {
  private pastelSvc = inject(PastelesService);

  readonly apiUrl = environment.apiUrl;
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
}
