import { Component, ChangeDetectorRef } from '@angular/core'; // <-- ضفنا الـ ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ResendConfirmationEmailRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-resend-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './resend-confirmation-email.component.html',
  styleUrls: ['./resend-confirmation-email.component.scss']
})
export class ResendConfirmationComponent {
  email: string = '';
  message: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  // حقنا الـ ChangeDetectorRef هنا
  constructor(private authService: AuthService, private cdr: ChangeDetectorRef) {}

  resend() {
    if (!this.email || this.isLoading) return;

    this.isLoading = true;
    this.message = '';
    this.isError = false;

    const requestBody: ResendConfirmationEmailRequest = {
      email: this.email
    };

    try {
      this.authService.resendConfirmationEmail(requestBody)
        .pipe(
          finalize(() => {
            this.isLoading = false; 
            this.cdr.detectChanges(); // 🚀 السر هنا: إجبار الواجهة إنها تعمل ريفريش للزرار
          })
        )
        .subscribe({
          next: () => {
            this.isError = false;
            this.message = 'Verification email sent successfully! Please check your inbox.';
            this.cdr.detectChanges(); // تحديث رسالة النجاح
          },
          error: (err) => {
            this.isError = true;
            this.message = err.error?.description || err.error?.message || 'Email already confirmed or invalid request.';
            this.cdr.detectChanges(); // تحديث رسالة الخطأ
          }
        });
    } catch (error) {
      // لو حصل أي كراش صامت في الكود، الزرار هيفك برضه
      this.isLoading = false;
      this.isError = true;
      this.message = "An unexpected error occurred.";
      this.cdr.detectChanges();
      console.error("Caught Error:", error);
    }
  }
}