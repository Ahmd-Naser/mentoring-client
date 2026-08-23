import { Difficulty } from './enums';

export interface ProblemResponse {
  id: number;
  name: string;
  link: string;
  notes?: string;
  difficulty: Difficulty;
}

export interface CreateProblemRequest {
  name: string;
  link: string;
  notes?: string;
  difficulty: Difficulty;
}