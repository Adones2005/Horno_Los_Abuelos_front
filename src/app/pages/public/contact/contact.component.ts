import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageTitleComponent } from '../../shared/page-title/page-title.component';
import { finalize } from 'rxjs';
import { ContactService, ContactMessage } from '../../../core/services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactS = inject(ContactService);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    message: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  loading = false;
  success = false;
  errorMsg = '';

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const dto = this.form.value as ContactMessage;
    this.contactS
      .send(dto)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.success = true;
          this.form.reset();
        },
        error: err => (this.errorMsg = err.message ?? 'Error al enviar mensaje'),
      });
  }
}
