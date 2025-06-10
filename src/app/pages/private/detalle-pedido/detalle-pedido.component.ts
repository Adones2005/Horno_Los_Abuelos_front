import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PedidosService, Pedido, PedidoPastel } from '../../../core/services/pedido.service';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
 imports: [CommonModule, PageTitleComponent, NgIf, NgFor, CurrencyPipe],
  templateUrl: './detalle-pedido.component.html',
  styleUrl: './detalle-pedido.component.scss'
})
export class DetallePedidoComponent implements OnInit, AfterViewInit {

  private pedidosSvc = inject(PedidosService);
  private route = inject(ActivatedRoute);

  pedido: Pedido | null = null;
  pasteles: PedidoPastel[] = [];
  errorMsg = '';
  readonly apiUrl = environment.apiUrl;

  ngOnInit(): void {
    const id = +(this.route.snapshot.paramMap.get('id') ?? 0);
    if (id) {
      this.pedidosSvc.getOne(id).subscribe({
        next: p => { this.pedido = p; this.initMap(); },
        error: err => this.errorMsg = err.message ?? 'Error al cargar pedido'
      });

      this.pedidosSvc.getPasteles(id)
        .pipe(catchError(err => { this.errorMsg = err.message; return of([]); }))
        .subscribe(p => this.pasteles = p);
    }
  }

  ngAfterViewInit(): void { this.initMap(); }

  private initMap(): void {
    if (!this.pedido) return;
    const mapEl = document.getElementById('map');
    if (mapEl && typeof google !== 'undefined') {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: this.pedido.direccion.texto }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          const map = new google.maps.Map(mapEl, { center: loc, zoom: 14 });
          new google.maps.Marker({ map, position: loc });
        }
      });
    }
  }
}
