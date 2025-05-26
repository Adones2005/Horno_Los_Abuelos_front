// src/app/pages/private/control-panel/control-panel.component.ts
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './control-panel.component.html',
})
export class ControlPanelComponent {}
