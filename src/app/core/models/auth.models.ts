// بيانات المستخدم المحفوظة في التطبيق
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// استجابة تسجيل الدخول وتجديد التوكن من السيرفر
export interface AuthResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiration: string;
}

// نماذج الطلبات (Requests)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ConfirmEmailRequest {
  userId: string;
  code: string;
}

export interface ResendConfirmationEmailRequest {
  email: string;
}

export interface ForgetPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}