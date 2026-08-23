import { Difficulty } from "./enums";

export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  subscribersCount: number;
  problemsCount: number;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
}

export interface TraineeDataResponse {
  id: string;
  name: string;
  email: string;
}

export interface AddTraineeRequest {
  email: string;
}

export interface GroupProblemResponse {
  id: number;
  name: string;
  link: string;
  difficulty: Difficulty;
  deadline?: string | null;
}

export interface AddGroupProblemRequest {
  problemId: number;
  deadline?: string | null;
}