import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estado',
  standalone: true
})
export class PedidoEstadoPipe implements PipeTransform {

  /** Filtra por estado (-1 = todos) */
  transform(list: any[], estado: number): any[] {
    return estado === -1 ? list : list.filter(p => p.estado === estado);
  }
}
