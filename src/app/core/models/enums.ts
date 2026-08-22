export enum Difficulty {
  Easy = 1,
  Medium = 2,
  Hard = 3
}

export enum ProblemStatus {
  NotOpened = 0,
  InProgress = 1,
  Attempted = 2,
  Successful = 3
}

export enum SubmissionVerdict {
  Accepted = 1,
  WrongAnswer = 2,
  TimeLimitExceeded = 3,
  MemoryLimitExceeded = 4,
  CompilationError = 5,
  RuntimeError = 6
}