import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { CustomValidators } from '../../../shared/validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isSuccess = signal<boolean>(false);

  registerForm: FormGroup = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this.passwordMatchValidator }
  );

  // Custom Validator للتحقق من تطابق كلمتي المرور
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  this.isLoading.set(true);
  this.errorMessage.set(null);

  const { firstName, lastName, email, password } = this.registerForm.value;

  this.authService.register({ firstName, lastName, email, password }).subscribe({
    next: () => {
      this.isLoading.set(false);
      this.isSuccess.set(true);
    },
    error: (err) => {
      this.isLoading.set(false);
      console.error('Registration Error Details:', err); // 👈 لطباعة تفاصيل الخطأ كاملة في الـ Console

      this.errorMessage.set(
        err?.error?.detail || 
        err?.error?.title || 
        (typeof err?.error === 'string' ? err.error : null) ||
        'Registration failed. Please check your data and connection.'
      );
    }
  });

  }
}