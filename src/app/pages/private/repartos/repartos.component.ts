import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgIf, isPlatformBrowser } from '@angular/common';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PedidosService } from '../../../core/services/pedido.service';
import { DireccionesService } from '../../../core/services/direcciones.service';

/*  Opción B: tratamos todo Google Maps como ANY  */
declare var google: any;

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
export class RepartosComponent implements OnInit, AfterViewInit, OnDestroy {
  /* ---------- Referencia al div del mapa ---------- */
  @ViewChild('mapRef', { static: false }) mapElement?: ElementRef<HTMLDivElement>;

  /* ---------- DI ---------- */
  private pedidosSvc = inject(PedidosService);
  private dirSvc     = inject(DireccionesService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser  = isPlatformBrowser(this.platformId);

  /* ---------- estado ---------- */
  pedidos: PedidoRow[] = [];
  errorMsg = '';

  /* ---------- Google Maps (any) ---------- */
  private map: any;
  private directionsService: any;
  private directionsRenderer: any;

  /* ---------- subs ---------- */
  private subs = new Subscription();

  /* ============ LIFECYCLE ============ */
  ngOnInit(): void {
    console.log('[Repartos] ngOnInit START');

    const s = combineLatest([
      this.pedidosSvc.getAll(),
      this.dirSvc.getAllTextos(),
    ])
      .pipe(
        map(([peds, dirs]) => {
          console.log('[Repartos] Datos recibidos', { pedidosRaw: peds, direccionesRaw: dirs });

          const dMap = new Map(dirs.map(d => [d.id, d.calle]));

          const rows = peds
            .filter(p => p.estado !== 2)        // solo pendientes
            .map<PedidoRow>(p => ({
              id: p.id,
              direccion: dMap.get(p.direccion) || '',
              estado: p.estado as 0 | 1 | 2,
            }));

          console.log('[Repartos] pedidos mapeados', rows);
          return rows;
        }),
        catchError(err => {
          this.errorMsg = err?.message || 'Error al cargar pedidos';
          console.error('[Repartos] catchError', err);
          return of([] as PedidoRow[]);
        })
      )
      .subscribe(peds => {
        console.log('[Repartos] suscripción CombineLatest emitió', peds);
        this.pedidos = peds;
        this.drawRoute();
      });

    this.subs.add(s);
    console.log('[Repartos] ngOnInit END');
  }

  ngAfterViewInit(): void {
    console.log('[Repartos] ngAfterViewInit. isBrowser=', this.isBrowser);
    if (this.isBrowser) {
      this.initMap();
    } else {
      console.warn('[Repartos] No es plataforma browser → no se inicializa mapa');
    }
  }

  ngOnDestroy(): void {
    console.log('[Repartos] ngOnDestroy → cancelando subs');
    this.subs.unsubscribe();
  }

  /* ============ GOOGLE MAPS ============ */
  private initMap(retry = 0): void {
    console.log(`[Repartos] initMap(): intento ${retry}`, {
      mapElementExists: !!this.mapElement?.nativeElement,
    });

    if (!this.mapElement?.nativeElement) {
      console.warn('[Repartos] mapElement aún no disponible');
      return;
    }

    if (typeof google === 'undefined' || !google.maps) {
      console.warn('[Repartos] Google Maps API no cargada aún');
      if (retry < 10) {
        setTimeout(() => this.initMap(retry + 1), 400);
      } else {
        console.error('[Repartos] Google Maps no se cargó tras 10 intentos');
      }
      return;
    }

    console.log('[Repartos] Google Maps API detectada → creando mapa');
    const center = { lat: 37.3891, lng: -5.9845 };

    this.map               = new google.maps.Map(this.mapElement.nativeElement, { center, zoom: 11 });
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });

    console.log('[Repartos] Map, DirectionsService y DirectionsRenderer creados', {
      map: this.map,
      directionsService: this.directionsService,
      directionsRenderer: this.directionsRenderer,
    });

    this.drawRoute();
  }

  private drawRoute(): void {
    console.log('[Repartos] drawRoute() called', {
      mapReady: !!this.map,
      pedidosLen: this.pedidos.length,
    });

    if (!this.map) {
      console.warn('[Repartos] drawRoute abort: mapa no inicializado');
      return;
    }
    if (this.pedidos.length < 2) {
      console.warn('[Repartos] drawRoute abort: menos de 2 pedidos');
      return;
    }

    const dirs      = this.pedidos.map(p => p.direccion);
    const waypoints = dirs.slice(1, -1).map(addr => ({ location: addr, stopover: true }));

    console.log('[Repartos] Solicitando ruta', { origin: dirs[0], destination: dirs.at(-1), waypoints });

    this.directionsService.route(
      {
        origin: dirs[0],
        destination: dirs[dirs.length - 1],
        waypoints,
        travelMode: 'DRIVING',
      },
      (res: any, status: any) => {
        console.log('[Repartos] directionsService callback', { status, res });
        if (status === 'OK') {
          this.directionsRenderer.setDirections(res);
          console.log('[Repartos] Ruta dibujada con éxito');
        } else {
          console.error('[Repartos] Error al pedir direcciones', status);
        }
      }
    );
  }

  /* ============ UI ACTIONS ============ */
  entregar(p: PedidoRow): void {
    console.log('[Repartos] entregar() clic en pedido', p);
    if (p.estado === 2) return;

    this.pedidosSvc.entregar(p.id).subscribe({
      next: () => {
        console.log('[Repartos] Pedido entregado OK', p.id);
        p.estado = 2;
        this.drawRoute();
      },
      error: err => {
        console.error('[Repartos] Error al marcar entregado', err);
        alert(err?.message || 'Error al entregar');
      },
    });
  }
}
