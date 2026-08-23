import { ProblemStatus, SubmissionVerdict } from './enums';

// يطابق TraineeProblemResponse.cs
export interface TraineeProblemResponse {
  id: number;
  status: ProblemStatus;
  lastStartedAt?: string | null;
}

// يطابق TraineeProblemMinutesResponse.cs
export interface TraineeProblemMinutesResponse {
  minutes: number;
}

// يطابق UpdateTraineeProblemRequest.cs
export interface UpdateTraineeProblemRequest {
  status: ProblemStatus;
}

// يطابق SubmissionRequest.cs
export interface SubmissionRequest {
  codeLink: string;
  notes?: string | null;
  verdict: SubmissionVerdict;
}

// يطابق SubmissionResponse.cs
export interface SubmissionResponse {
  id: number;
  codeLink: string;
  notes?: string | null;
  verdict: SubmissionVerdict;
  createdAt: string;
}