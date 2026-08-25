import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TraineeProblemMinutesResponse,
  TraineeProblemResponse,
  TraineeProblemReviewResponse,
  UpdateTraineeProblemRequest
} from '../models/trainee-problem.models';

@Injectable({
  providedIn: 'root'
})
export class TraineeProblemsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/TraineeProblems`;

  // GET api/TraineeProblems/group/{groupId}
  getByGroup(groupId: number): Observable<TraineeProblemResponse[]> {
    return this.http.get<TraineeProblemResponse[]>(`${this.baseUrl}/group/${groupId}`);
  }

  // GET api/TraineeProblems/group/{groupId}/problem/{problemId}
  getTraineeProblem(groupId: number, problemId: number): Observable<TraineeProblemResponse> {
    return this.http.get<TraineeProblemResponse>(`${this.baseUrl}/group/${groupId}/problem/${problemId}`);
  }

  // GET api/TraineeProblems/group/{groupId}/problem/{problemId}/total-minutes
  getTotalMinutes(groupId: number, problemId: number): Observable<TraineeProblemMinutesResponse> {
    return this.http.get<TraineeProblemMinutesResponse>(
      `${this.baseUrl}/group/${groupId}/problem/${problemId}/total-minutes`
    );
  }

  // POST api/TraineeProblems/group/{groupId}/problem/{problemId}/start-toggle
  toggleTimer(groupId: number, problemId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/group/${groupId}/problem/${problemId}/start-toggle`,
      {}
    );
  }

  // PUT api/TraineeProblems/group/{groupId}/problem/{problemId}
  updateStatus(
    groupId: number,
    problemId: number,
    request: UpdateTraineeProblemRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/group/${groupId}/problem/${problemId}`,
      request
    );
  }

  // DELETE api/TraineeProblems/group/{groupId}/problem/{problemId}
  deleteTraineeProblem(groupId: number, problemId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/group/${groupId}/problem/${problemId}`
    );
  }

  // GET api/TraineeProblems/group/{groupId}/problem/{problemId}/reviews
getProblemReviews(groupId: number, problemId: number): Observable<TraineeProblemReviewResponse[]> {
  return this.http.get<TraineeProblemReviewResponse[]>(
    `${this.baseUrl}/group/${groupId}/problem/${problemId}/reviews`
  );
}
}