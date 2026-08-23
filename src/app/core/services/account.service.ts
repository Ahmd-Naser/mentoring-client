import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfileResponse
} from '../models/account.models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/me`;

  // جلب بيانات الملف الشخصي
  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}`);
  }

  // تعديل الاسم والبيانات الأساسية
  updateProfile(request: UpdateProfileRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.baseUrl}`, request);
  }

  // تغيير كلمة المرور
  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/change-password`, request);
  }
}