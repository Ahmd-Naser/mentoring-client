import { Difficulty } from './enums';

export interface GroupResponse {
  id: number;
  name: string;
  description?: string | null;
  ownerId?: string;
  ownerName?: string;
  memberCount?: number;
  problemCount?: number;
}

export interface GroupDetailsResponse {
  id: number;
  name: string;
  description?: string | null;
  ownerId: string;
  ownerName?: string;
  createdAt?: string;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
}

export interface AddTraineeRequest {
  email: string;
}

export interface TraineeInGroupResponse {
  id?: string;
  userId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export type TraineeDataResponse = TraineeInGroupResponse;

export interface GroupProblemResponse {
  problemId: number;
  name: string;
  link: string;
  difficulty: Difficulty;
  deadline?: string | null;
}