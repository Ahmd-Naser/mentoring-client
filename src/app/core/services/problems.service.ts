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
  private readonly baseUrl = `${environment.apiUrl}/api/Problems`;

  // GET api/Problems
  getAll(): Observable<ProblemResponse[]> {
    return this.http.get<ProblemResponse[]>(this.baseUrl);
  }

  // GET api/Problems/{id}
  getById(id: number): Observable<ProblemResponse> {
    return this.http.get<ProblemResponse>(`${this.baseUrl}/${id}`);
  }

  // POST api/Problems
  create(request: CreateProblemRequest): Observable<ProblemResponse> {
    return this.http.post<ProblemResponse>(this.baseUrl, request);
  }

  // PUT api/Problems/{id}
  update(id: number, request: CreateProblemRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  // DELETE api/Problems/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}