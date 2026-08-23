import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AddGroupProblemRequest,
  AddTraineeRequest,
  CreateGroupRequest,
  GroupResponse,
  GroupProblemResponse,
  TraineeDataResponse
} from '../models/group.models';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/groups`;

  // جلب جميع المجموعات
  getAll(): Observable<GroupResponse[]> {
    return this.http.get<GroupResponse[]>(`${this.baseUrl}/me`);
  }

  // جلب تفاصيل مجموعة محددة بالـ Id
  getById(id: number): Observable<GroupResponse> {
    return this.http.get<GroupResponse>(`${this.baseUrl}/${id}`);
  }

  // إنشاء مجموعة جديدة (يصبح المنشئ هو المالك/المرشد تلقائياً)
  create(request: CreateGroupRequest): Observable<GroupResponse> {
    return this.http.post<GroupResponse>(`${this.baseUrl}`, request);
  }

  // إضافة متدرب للمجموعة (Owner Only)
  addTrainee(groupId: number, request: AddTraineeRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${groupId}/trainees`, request);
  }

  // جلب قائمة المتدربين في المجموعة
  getTrainees(groupId: number): Observable<TraineeDataResponse[]> {
    return this.http.get<TraineeDataResponse[]>(`${this.baseUrl}/${groupId}/trainees`);
  }

  // 🌟 جلب المسائل المخصصة للمجموعة
  getGroupProblems(groupId: number): Observable<GroupProblemResponse[]> {
    return this.http.get<GroupProblemResponse[]>(`${this.baseUrl}/${groupId}/problems`);
  }

  // 🌟 إسناد مسألة جديدة للمجموعة (Owner Only)
  addProblemToGroup(groupId: number, request: AddGroupProblemRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${groupId}/problems/${request.problemId}`, request);
  }
}