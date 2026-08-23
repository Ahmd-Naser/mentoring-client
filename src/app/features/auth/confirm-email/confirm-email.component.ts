import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './confirm-email.component.html', 
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  state = signal<'verifying' | 'success' | 'error'>('verifying');
  errorMessage = signal<string | null>(null);
  resendSuccess = signal<boolean>(false);
  isResending = signal<boolean>(false);

  resendForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const code = this.route.snapshot.queryParamMap.get('code');

    if (!userId || !code) {
      this.state.set('error');
      this.errorMessage.set('Invalid verification link. Missing user ID or verification token.');
      return;
    }

    this.verifyEmail(userId, code);
  }

  verifyEmail(userId: string, code: string): void {
    this.state.set('verifying');

    this.authService.confirmEmail({ userId, code }).subscribe({
      next: () => {
        this.state.set('success');
      },
      error: (err) => {
        this.state.set('error');
        this.errorMessage.set(
          err?.error?.detail || err?.error?.message || 'Verification token has expired or is invalid.'
        );
      }
    });
  }

  onResendSubmit(): void {
    if (this.resendForm.invalid) {
      this.resendForm.markAllAsTouched();
      return;
    }

    this.isResending.set(true);
    this.resendSuccess.set(false);

    this.authService.resendConfirmationEmail(this.resendForm.value).subscribe({
      next: () => {
        this.isResending.set(false);
        this.resendSuccess.set(true);
      },
      error: (err) => {
        this.isResending.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to resend confirmation email.');
      }
    });
  }
}