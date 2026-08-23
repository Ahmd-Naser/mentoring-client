import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TraineeProblemMinutesResponse,
  TraineeProblemResponse,
  UpdateTraineeProblemRequest
} from '../models/workspace.models';

@Injectable({
  providedIn: 'root'
})
export class TraineeProblemsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/TraineeProblems`;

  // GET api/TraineeProblems/group/{groupId}/problem/{problemId}
  getTraineeProblem(groupId: number, problemId: number): Observable<TraineeProblemResponse> {
    return this.http.get<TraineeProblemResponse>(`${this.baseUrl}/group/${groupId}/problem/${problemId}`);
  }

  // GET api/TraineeProblems/group/{groupId}/problem/{problemId}/total-minutes
  getTotalMinutesSpent(groupId: number, problemId: number): Observable<TraineeProblemMinutesResponse> {
    return this.http.get<TraineeProblemMinutesResponse>(
      `${this.baseUrl}/group/${groupId}/problem/${problemId}/total-minutes`
    );
  }

  // POST api/TraineeProblems/group/{groupId}/problem/{problemId}/start
  startProblem(groupId: number, problemId: number): Observable<TraineeProblemResponse> {
    return this.http.post<TraineeProblemResponse>(
      `${this.baseUrl}/group/${groupId}/problem/${problemId}/start`,
      {}
    );
  }

  // PUT api/TraineeProblems/group/{groupId}/problem/{problemId}
  updateTraineeProblem(
    groupId: number,
    problemId: number,
    request: UpdateTraineeProblemRequest
  ): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/group/${groupId}/problem/${problemId}`, request);
  }

  // DELETE api/TraineeProblems/group/{groupId}/problem/{problemId}
  deleteTraineeProblem(groupId: number, problemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/group/${groupId}/problem/${problemId}`);
  }
}