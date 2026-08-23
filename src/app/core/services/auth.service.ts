import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  ConfirmEmailRequest,
  ForgetPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResendConfirmationEmailRequest,
  ResetPasswordRequest,
  User
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // مفاتيح التخزين في الـ LocalStorage
  private readonly TOKEN_KEY = 'mentoring_access_token';
  private readonly REFRESH_TOKEN_KEY = 'mentoring_refresh_token';
  private readonly USER_KEY = 'mentoring_user';

  // 🌟 إدارة الحالة باستخدام Signals
  private _currentUser = signal<User | null>(this.getUserFromStorage());
  public currentUser = this._currentUser.asReadonly();

  // إشارة مشتقة (Computed Signal) لمعرفة هل المستخدم مسجل دخول أم لا
  public isAuthenticated = computed(() => !!this._currentUser());

  // ===========================
  // عمليات المصادقة (Auth Methods)
  // ===========================

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/register`, request);
  }

  confirmEmail(request: ConfirmEmailRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/confirm-email`, request);
  }

  resendConfirmationEmail(request: ResendConfirmationEmailRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/resend-confirmation-email`, request);
  }

  forgotPassword(request: ForgetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/forget-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset-password`, request);
  }

  refreshToken(): Observable<AuthResponse> {
    const payload: RefreshTokenRequest = {
      token: this.getToken() || '',
      refreshToken: this.getRefreshToken() || ''
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/refresh-token`, payload).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  // ===========================
  // دوال مساعدة (Helper Methods)
  // ===========================

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    const user: User = {
      id: response.id,
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName
    };

    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this._currentUser.set(user);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }
}