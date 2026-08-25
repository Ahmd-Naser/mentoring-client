import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubmissionRequest, SubmissionResponse } from '../models/trainee-problem.models';

@Injectable({
  providedIn: 'root'
})
export class SubmissionsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Submissions`;

  // GET api/Submissions/trainee-problem/{traineeProblemId}
  getAllForTraineeProblem(traineeProblemId: number): Observable<SubmissionResponse[]> {
    return this.http.get<SubmissionResponse[]>(`${this.baseUrl}/trainee-problem/${traineeProblemId}`);
  }

  // POST api/Submissions/trainee-problem/{traineeProblemId}
  addSubmission(traineeProblemId: number, request: SubmissionRequest): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(
      `${this.baseUrl}/trainee-problem/${traineeProblemId}`,
      request
    );
  }

  // DELETE api/Submissions/{id}
  deleteSubmission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}