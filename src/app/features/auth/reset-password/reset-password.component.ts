import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  userId = signal<string | null>(null);
  code = signal<string | null>(null);

  isLoading = signal<boolean>(false);
  isSuccess = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  resetForm: FormGroup = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required]]
    },
    { validators: this.passwordMatchValidator }
  );

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmNewPassword')?.value;
    return newPass === confirmPass ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    const userIdParam = this.route.snapshot.queryParamMap.get('userId');
    const codeParam =
      this.route.snapshot.queryParamMap.get('code') ||
      this.route.snapshot.queryParamMap.get('token');

    if (!userIdParam || !codeParam) {
      this.errorMessage.set('Invalid password reset link. Missing user ID or reset token.');
      return;
    }

    this.userId.set(userIdParam);
    this.code.set(codeParam);
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.userId() || !this.code()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload: ResetPasswordRequest = {
      userId: this.userId()!,
      code: this.code()!,
      newPassword: this.resetForm.value.newPassword,
      email: ''
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.detail || err?.error?.message || 'Failed to reset password. The token may have expired.'
        );
      }
    });
  }
}