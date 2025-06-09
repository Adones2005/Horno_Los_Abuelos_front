import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageTitleComponent } from '../../../shared/page-title/page-title.component';
import { finalize } from 'rxjs/operators';

import {
  LoginService,
  LoginCredentials,
} from '../../../core/services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageTitleComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  /* ---------- inyección via `inject()` ---------- */
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);

  /* ---------- formulario reactivo ---------- */
  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: true,
  });

  loading = false;
  errorMsg = '';

  /* ---------- envío de credenciales ---------- */
  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMsg = '';

    const credentials = this.form.value as LoginCredentials;

    this.loginService
  .login(credentials)
  .pipe(finalize(() => (this.loading = false)))
  .subscribe({
    next: () => this.router.navigateByUrl('/control-panel'),
    error: err => (this.errorMsg = err.message),
  });

  }
}
