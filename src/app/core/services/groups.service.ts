import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddTraineeRequest,
  CreateGroupRequest,
  GroupDetailsResponse,
  GroupProblemResponse,
  GroupResponse,
  TraineeInGroupResponse
} from '../models/group.models';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/Groups`;

  // GET api/Groups/me
  getAll(): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(`${this.baseUrl}/me`);
  }

  // GET api/Groups/{id}
  getById(id: number): Observable<GroupDetailsResponse> {
    return this.http.get<GroupDetailsResponse>(`${this.baseUrl}/${id}`);
  }

  // POST api/Groups
  create(request: CreateGroupRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(this.baseUrl, request);
  }

  // PUT api/Groups/{id}
  update(id: number, request: CreateGroupRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  // DELETE api/Groups/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // GET api/Groups/{groupId}/trainees
  getTrainees(groupId: number): Observable<TraineeInGroupResponse[]> {
    return this.http.get<TraineeInGroupResponse[]>(`${this.baseUrl}/${groupId}/trainees`);
  }

  // POST api/Groups/{groupId}/trainees
  addTrainee(groupId: number, request: AddTraineeRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${groupId}/trainees`, request);
  }

  // DELETE api/Groups/{groupId}/trainees
  removeTrainee(groupId: number, request: AddTraineeRequest): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${groupId}/trainees`, { body: request });
  }

  // GET api/Groups/{groupId}/problems
  getProblems(groupId: number): Observable<GroupProblemResponse[]> {
    return this.http.get<GroupProblemResponse[]>(`${this.baseUrl}/${groupId}/problems`);
  }

  // 🌟 دالة بديلة للتوافق مع الكود القديم
getGroupProblems(groupId: number): Observable<GroupProblemResponse[]> {
  return this.getProblems(groupId);
}

  // POST api/Groups/{groupId}/problems/{problemId}
  // addProblem(groupId: number, problemId: number): Observable<void> {
  //   return this.http.post<void>(`${this.baseUrl}/${groupId}/problems/${problemId}`, {});
  // }

  // DELETE api/Groups/{groupId}/problems/{problemId}
  removeProblem(groupId: number, problemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${groupId}/problems/${problemId}`);
  }

  // 🌟 إضافة هذا الاسم البديل للتوافق
// addProblemToGroup(groupId: number, problemId: number): Observable<void> {
//   return this.addProblem(groupId, problemId);
// }

addProblem(groupId: number, problemIdOrPayload: number | { problemId: number; deadline?: string | null }): Observable<void> {
  const problemId = typeof problemIdOrPayload === 'number' 
    ? problemIdOrPayload 
    : problemIdOrPayload.problemId;

  return this.http.post<void>(`${this.baseUrl}/${groupId}/problems/${problemId}`, {});
}

addProblemToGroup(groupId: number, problemIdOrPayload: number | { problemId: number; deadline?: string | null }): Observable<void> {
  return this.addProblem(groupId, problemIdOrPayload);
}
}