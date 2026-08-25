import { ProblemStatus, SubmissionVerdict } from './enums';

export interface TraineeProblemMinutesResponse {
  minutes: number;
}

export interface TraineeProblemResponse {
  id: number;
  problemName: string;
  problemLink: string;
  status: ProblemStatus;
  lastStartedAt?: string | null;
}

export interface UpdateTraineeProblemRequest {
  status: ProblemStatus;
}

export interface SubmissionRequest {
  codeLink: string;
  notes?: string | null;
  verdict: SubmissionVerdict;
}

export interface SubmissionResponse {
  id: number;
  codeLink: string;
  notes?: string | null;
  verdict: SubmissionVerdict;
  createdAt: string;
}