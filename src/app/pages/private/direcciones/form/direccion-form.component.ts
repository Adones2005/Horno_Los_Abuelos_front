import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DireccionesService, Direccion } from '../../../../core/services/direcciones.service';
import { ClientesService, Cliente } from '../../../../core/services/cliente.service';
import { RutasService, Ruta } from '../../../../core/services/rutas.service';
import { PageTitleComponent } from '../../../../shared/page-title/page-title.component';
import { finalize, Observable, of } from 'rxjs';

declare const google: any;

@Component({
  selector: 'app-direccion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageTitleComponent],
  templateUrl: './direccion-form.component.html',
})
export class DireccionFormComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private dirSvc = inject(DireccionesService);
  private clienteSvc = inject(ClientesService);
  private rutasSvc = inject(RutasService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = false;
  errorMsg = '';
  editMode = false;
  direccionId: number | null = null;

  rutas$: Observable<Ruta[]> = of([]);
  clientes$: Observable<Cliente[]> = of([]);

  form = this.fb.group(
    {
      calle: ['', [Validators.required, Validators.maxLength(255)]],
      ciudad: ['', [Validators.required, Validators.maxLength(100)]],
      codigoPostal: ['', [Validators.required, Validators.maxLength(10)]],
      rutaId: [0, [Validators.required, Validators.min(1)]],
      clienteId: [0, [Validators.required, Validators.min(1)]],
    },
    { nonNullable: true }
  );

  map!: any;
  marker!: any;
  autocomplete!: any;

  ngOnInit(): void {
    this.rutas$ = this.rutasSvc.getAll();
    this.clientes$ = this.clienteSvc.getAll();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.direccionId = +id;
      this.dirSvc.getById(+id).subscribe({
        next: d => this.form.patchValue({
          calle: d.calle,
          ciudad: d.ciudad,
          codigoPostal: d.codigoPostal,
          rutaId: d.rutaId,
          clienteId: d.clienteId,
        }),
        error: err => (this.errorMsg = err.message ?? 'Error al cargar dirección'),
      });
    }
  }

  ngAfterViewInit(): void {
    const mapEl = document.getElementById('map');
    if (mapEl && typeof google !== 'undefined') {
      const center = { lat: 37.3891, lng: -5.9845 };
      this.map = new google.maps.Map(mapEl, { center, zoom: 6 });
      this.marker = new google.maps.Marker({ map: this.map, position: center, draggable: true });
      const input = document.getElementById('autocomplete') as HTMLInputElement;
      if (input) {
        this.autocomplete = new google.maps.places.Autocomplete(input);
        this.autocomplete.addListener('place_changed', () => {
          const place = this.autocomplete.getPlace();
          if (!place.geometry) return;
          const loc = place.geometry.location;
          this.map.panTo(loc);
          this.marker.setPosition(loc);
          const addr = place.address_components;
          const city = addr?.find((c:any)=>c.types.includes('locality'))?.long_name || '';
          const cp = addr?.find((c:any)=>c.types.includes('postal_code'))?.long_name || '';
          this.form.patchValue({
            calle: place.formatted_address ?? '',
            ciudad: city,
            codigoPostal: cp,
          });
        });
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const dto: Omit<Direccion, 'id'> = this.form.value as any;
    if (this.editMode && this.direccionId != null) {
      this.dirSvc
        .update(this.direccionId, dto)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => this.router.navigateByUrl('/control-panel/direcciones'),
          error: err => (this.errorMsg = err.message ?? 'Error al guardar'),
        });
    } else {
      this.dirSvc
        .create(dto)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: () => this.router.navigateByUrl('/control-panel/direcciones'),
          error: err => (this.errorMsg = err.message ?? 'Error al guardar'),
        });
    }
  }

  volver(): void {
    this.router.navigateByUrl('/control-panel/direcciones');
  }
}
