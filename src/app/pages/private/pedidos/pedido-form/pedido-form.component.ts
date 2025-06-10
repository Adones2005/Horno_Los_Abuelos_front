import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DireccionesService, Direccion } from '../../../../core/services/direcciones.service';
import { PastelesService, Pastel } from '../../../../core/services/pasteles.service';
import { PedidosService } from '../../../../core/services/pedido.service';
import { LoginService } from '../../../../core/services/login.service';
import { PageTitleComponent } from '../../../../shared/page-title/page-title.component';
import { Observable, of, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

interface ItemPedido { pastel: Pastel; cantidad: number; }

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, PageTitleComponent],
  templateUrl: './pedido-form.component.html',
})
export class PedidoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dirSvc = inject(DireccionesService);
  private pastelesSvc = inject(PastelesService);
  private pedidosSvc = inject(PedidosService);
  private loginSvc = inject(LoginService);
  private router = inject(Router);

  readonly apiUrl = environment.apiUrl;

  direcciones$: Observable<Direccion[]> = of([]);
  pasteles$: Observable<Pastel[]> = of([]);

  filteredDirecciones$: Observable<Direccion[]> = of([]);
  searchCtrl = this.fb.control('');
  filteredPasteles$: Observable<Pastel[]> = of([]);

  private dirClienteMap = new Map<number, number>();

  items: ItemPedido[] = [];
  qtyMap: Record<number, number> = {};

  loading = false;
  errorMsg = '';

  form = this.fb.group(
    {
      direccionId: [0, [Validators.required, Validators.min(1)]],
    },
    { nonNullable: true }
  );

  ngOnInit(): void {
    this.loginSvc.role$.subscribe(r => {
      if (r !== 'comercial') {
        this.router.navigateByUrl('/control-panel/pedidos');
      }
    });

    this.direcciones$ = this.dirSvc.getAll();
    this.pasteles$ = this.pastelesSvc.getAll();

    this.filteredDirecciones$ = this.direcciones$;
    this.direcciones$.subscribe(ds => {
      ds.forEach(d => this.dirClienteMap.set(d.id, d.clienteId));
    });

    this.filteredPasteles$ = combineLatest([
      this.pasteles$,
      this.searchCtrl.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([p, term]) =>
        p.filter(pt =>
          pt.nombre.toLowerCase().includes((term ?? '').toLowerCase())
        )
      )
    );
  }

  agregar(p: Pastel, cant: number) {
    if (cant <= 0) return;
    const existing = this.items.find(i => i.pastel.id === p.id);
    if (existing) {
      existing.cantidad += cant;
    } else {
      this.items.push({ pastel: p, cantidad: cant });
    }
    this.qtyMap[p.id] = 1;
  }

  quitar(id: number) {
    this.items = this.items.filter(i => i.pastel.id !== id);
  }

  onSubmit(): void {
    if (this.form.invalid || this.items.length === 0) return;
    this.loading = true;
    const dirId = this.form.value.direccionId!;
    const dto = {
      clienteId: this.dirClienteMap.get(dirId)!,
      direccionId: dirId,
      items: this.items.map(i => ({ pastelId: i.pastel.id, cantidad: i.cantidad })),
    };
    this.pedidosSvc.create(dto).subscribe({
      next: () => this.router.navigateByUrl('/control-panel/pedidos'),
      error: err => {
        this.errorMsg = err.message ?? 'Error al crear pedido';
        this.loading = false;
      }
    });
  }

  volver(): void {
    this.router.navigateByUrl('/control-panel/pedidos');
  }
}