import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateProblemRequest, ProblemResponse } from '../models/problem.models';

@Injectable({
  providedIn: 'root'
})
export class ProblemsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/problems`;

  // جلب جميع المسائل من بنك المسائل
  getAll(): Observable<ProblemResponse[]> {
    return this.http.get<ProblemResponse[]>(this.baseUrl);
  }

  // جلب تفاصيل مسألة محددة
  getById(id: number): Observable<ProblemResponse> {
    return this.http.get<ProblemResponse>(`${this.baseUrl}/${id}`);
  }

  // إضافة مسألة جديدة إلى بنك المسائل
  create(request: CreateProblemRequest): Observable<ProblemResponse> {
    return this.http.post<ProblemResponse>(this.baseUrl, request);
  }
}