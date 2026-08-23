import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './profile.component.html', 
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab = signal<'general' | 'security'>('general');
  
  isLoading = signal<boolean>(true);
  isUpdatingProfile = signal<boolean>(false);
  isChangingPassword = signal<boolean>(false);

  profileSuccessMessage = signal<string | null>(null);
  profileErrorMessage = signal<string | null>(null);

  passwordSuccessMessage = signal<string | null>(null);
  passwordErrorMessage = signal<string | null>(null);

  userEmail = signal<string>('');

  // نموذج تعديل البيانات الشخصية
  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]]
  });

  // نموذج تغيير كلمة المرور
  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
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
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading.set(true);
    this.accountService.getProfile().subscribe({
      next: (profile) => {
        this.userEmail.set(profile.email);
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        // جلب البيانات من الـ AuthService كحل احتياطي
        const cachedUser = this.authService.currentUser();
        if (cachedUser) {
          this.userEmail.set(cachedUser.email);
          this.profileForm.patchValue({
            firstName: cachedUser.firstName,
            lastName: cachedUser.lastName
          });
        }
        this.isLoading.set(false);
      }
    });
  }

  onUpdateProfile(): void {
  if (this.profileForm.invalid) {
    this.profileForm.markAllAsTouched();
    return;
  }

  this.isUpdatingProfile.set(true);
  this.profileSuccessMessage.set(null);
  this.profileErrorMessage.set(null);

  this.accountService.updateProfile(this.profileForm.value).subscribe({
    next: (updatedProfile) => {
      this.isUpdatingProfile.set(false);
      this.profileSuccessMessage.set('Profile information updated successfully.');

      // 🌟 تحديث المستخدم عبر AuthService
      this.authService.updateCurrentUser({
        firstName: updatedProfile.firstName || this.profileForm.value.firstName,
        lastName: updatedProfile.lastName || this.profileForm.value.lastName
      });
    },
    error: (err) => {
      this.isUpdatingProfile.set(false);
      this.profileErrorMessage.set(
        err?.error?.detail || err?.error?.message || 'Failed to update profile.'
      );
    }
  });
}

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    this.passwordSuccessMessage.set(null);
    this.passwordErrorMessage.set(null);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.accountService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordSuccessMessage.set('Password changed successfully.');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isChangingPassword.set(false);
        this.passwordErrorMessage.set(
          err?.error?.detail || err?.error?.message || 'Failed to change password. Please verify your current password.'
        );
      }
    });
  }
}