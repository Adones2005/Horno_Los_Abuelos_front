import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { of } from 'rxjs';

export interface PastelMock {
  id:     number;
  nombre: string;
  precio: number;
  imagen: string;
}

@Component({
  standalone: true,
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  imports: [NgIf, NgFor, AsyncPipe, CurrencyPipe],
})
export class CatalogoComponent{
}
