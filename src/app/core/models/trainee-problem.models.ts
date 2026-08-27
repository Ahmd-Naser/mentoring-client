import { ProblemStatus, SubmissionVerdict } from './enums';

export interface TraineeProblemMinutesResponse {
  minutes: number;
}

export interface TraineeProblemResponse {
  id: number;
  problemName: string;
  problemLink: string;
  notes?: string | null; // 🌟 تمت إضافتها هنا
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

export interface TraineeProblemReviewResponse {
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  status: ProblemStatus;
  totalMinutes: number;
  lastStartedAt?: string | null;
  submissions: SubmissionResponse[];
}