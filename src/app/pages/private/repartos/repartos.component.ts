import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { PedidosService, PedidoVM } from '../../../core/services/pedido.service';
import { DireccionesService } from '../../../core/services/direcciones.service';
import { combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

declare const google: any;

interface PedidoRow {
  id: number;
  direccion: string;
  estado: 0 | 1 | 2;
}

@Component({
  selector: 'app-repartos',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './repartos.component.html',
})
export class RepartosComponent implements OnInit, AfterViewInit {
  private pedidosSvc = inject(PedidosService);
  private dirSvc = inject(DireccionesService);

  pedidos: PedidoRow[] = [];
  errorMsg = '';

  map: any;
  directionsService: any;
  directionsRenderer: any;

  ngOnInit(): void {
    combineLatest([
      this.pedidosSvc.getAll(),
      this.dirSvc.getAllTextos(),
    ])
      .pipe(
        map(([peds, dirs]) => {
          const dMap = new Map(dirs.map(d => [d.id, d.calle]));
          return peds
            .filter(p => p.estado !== 2)
            .map(p => ({
              id: p.id,
              direccion: dMap.get(p.direccion) ?? '',
              estado: p.estado,
            }));
        }),
        catchError(err => {
          this.errorMsg = err.message ?? 'Error al cargar pedidos';
          return of([] as PedidoRow[]);
        })
      )
      .subscribe(peds => {
        this.pedidos = peds;
        this.drawRoute();
      });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    const el = document.getElementById('map');
    if (el && typeof google !== 'undefined') {
      const center = { lat: 37.3891, lng: -5.9845 };
      this.map = new google.maps.Map(el, { center, zoom: 11 });
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });
      this.drawRoute();
    }
  }

  drawRoute(): void {
    if (!this.map || this.pedidos.length < 2) return;
    const dirs = this.pedidos.map(p => p.direccion);
    const waypoints = dirs.slice(1, -1).map(addr => ({ location: addr, stopover: true }));
    this.directionsService.route(
      {
        origin: dirs[0],
        destination: dirs[dirs.length - 1],
        waypoints,
        travelMode: 'DRIVING',
      },
      (res: any, status: any) => {
        if (status === 'OK') this.directionsRenderer.setDirections(res);
      }
    );
  }

  entregar(p: PedidoRow): void {
    if (p.estado === 2) return;
    this.pedidosSvc.entregar(p.id).subscribe({
      next: () => {
        p.estado = 2;
      },
      error: err => alert(err.message),
    });
  }
}