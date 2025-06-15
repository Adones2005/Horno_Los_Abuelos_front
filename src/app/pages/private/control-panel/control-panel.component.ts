// src/app/pages/private/control-panel/control-panel.component.ts
import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../core/services/login.service';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './control-panel.component.html',
})
export class ControlPanelComponent {

    private loginSvc = inject(LoginService);

    
    role$ = this.loginSvc.role$;           



    sidebarOpen = false;
    toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }



}
