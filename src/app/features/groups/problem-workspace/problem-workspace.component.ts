import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TraineeProblemsService } from '../../../core/services/trainee-problems.service';
import { SubmissionsService } from '../../../core/services/submissions.service';
import { ProblemsService } from '../../../core/services/problems.service';
import { ProblemResponse } from '../../../core/models/problem.models';
import { SubmissionVerdict, ProblemStatus, Difficulty } from '../../../core/models/enums';
import {
  SubmissionResponse,
  TraineeProblemResponse
} from '../../../core/models/trainee-problem.models';

@Component({
  selector: 'app-problem-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DatePipe, NavbarComponent],
  templateUrl: './problem-workspace.component.html',
  styleUrl: './problem-workspace.component.scss'
})
export class ProblemWorkspaceComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private traineeProblemsService = inject(TraineeProblemsService);
  private submissionsService = inject(SubmissionsService);
  private problemsService = inject(ProblemsService);

  groupId = signal<number>(0);
  problemId = signal<number>(0);

  problem = signal<ProblemResponse | null>(null);
  traineeProblem = signal<TraineeProblemResponse | null>(null);
  submissions = signal<SubmissionResponse[]>([]);
  totalMinutes = signal<number>(0);

  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  isUpdatingStatus = signal<boolean>(false);

  ProblemStatus = ProblemStatus;
  SubmissionVerdict = SubmissionVerdict;

  private timerInterval: any = null;

  // فحص تشغيل المؤقت
  isTimerRunning = computed(() => !!this.traineeProblem()?.lastStartedAt);

  // فحص هل تم حل المسألة بنجاح (يدعم String و Number)
  isSuccessful = computed(() => {
    const s = this.traineeProblem()?.status?.toString().toLowerCase();
    return s === '3' || s === 'successful' || s === 'solved';
  });

  submissionForm: FormGroup = this.fb.group({
    codeLink: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    verdict: [SubmissionVerdict.Accepted, [Validators.required]],
    notes: ['']
  });

  ngOnInit(): void {
    const gId = this.route.snapshot.paramMap.get('groupId');
    const pId = this.route.snapshot.paramMap.get('problemId');

    if (!gId || !pId) {
      this.router.navigate(['/groups']);
      return;
    }

    this.groupId.set(+gId);
    this.problemId.set(+pId);

    this.loadWorkspaceData();
  }

  ngOnDestroy(): void {
    this.stopLocalTimer();
  }

  loadWorkspaceData(): void {
    this.isLoading.set(true);

    this.problemsService.getById(this.problemId()).subscribe({
      next: (res: any) => this.problem.set(res?.value || res),
      error: (err) => console.error('Failed to load problem details', err)
    });

    this.loadTraineeTrackingData(() => {
      this.isLoading.set(false);
    });
  }

  loadTraineeTrackingData(callback?: () => void): void {
    this.traineeProblemsService
      .getTraineeProblem(this.groupId(), this.problemId())
      .subscribe({
        next: (res: any) => {
          const tp = res?.value || res;
          this.traineeProblem.set(tp);

          if (tp?.lastStartedAt) {
            this.startLocalTimer();
          } else {
            this.stopLocalTimer();
          }

          if (tp && tp.id) {
            this.loadSubmissions(tp.id);
          }
          this.loadTotalMinutes();
          if (callback) callback();
        },
        error: (err) => {
          console.error('Failed to load tracking data', err);
          if (callback) callback();
        }
      });
  }

  loadTotalMinutes(): void {
    this.traineeProblemsService
      .getTotalMinutes(this.groupId(), this.problemId())
      .subscribe({
        next: (res: any) => {
          const data = res?.value || res;
          this.totalMinutes.set(data?.minutes || 0);
        },
        error: (err) => console.error('Failed to load minutes', err)
      });
  }

  loadSubmissions(traineeProblemId: number): void {
    this.submissionsService.getAllForTraineeProblem(traineeProblemId).subscribe({
      next: (res: any) => {
        const list = res?.value || res;
        this.submissions.set(Array.isArray(list) ? list : []);
      },
      error: (err) => console.error('Failed to load submissions', err)
    });
  }

  // تشغيل / إيقاف المؤقت
  onToggleTimer(): void {
    this.isUpdatingStatus.set(true);

    const isCurrentlyRunning = this.isTimerRunning();
    // تحديث بصري فوري للزر
    this.traineeProblem.update(tp => tp ? {
      ...tp,
      lastStartedAt: isCurrentlyRunning ? null : new Date().toISOString()
    } : null);

    if (!isCurrentlyRunning) {
      this.startLocalTimer();
    } else {
      this.stopLocalTimer();
    }

    this.traineeProblemsService
      .toggleTimer(this.groupId(), this.problemId())
      .subscribe({
        next: () => {
          this.isUpdatingStatus.set(false);
          this.loadTotalMinutes();
        },
        error: (err) => {
          this.isUpdatingStatus.set(false);
          this.loadTraineeTrackingData();
          alert(err?.error?.detail || err?.error?.message || 'Failed to toggle timer');
        }
      });
  }

  private startLocalTimer(): void {
    this.stopLocalTimer();
    this.timerInterval = setInterval(() => {
      this.loadTotalMinutes();
    }, 30000);
  }

  private stopLocalTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onChangeStatus(status: ProblemStatus): void {
    this.isUpdatingStatus.set(true);

    this.traineeProblem.update(tp => tp ? { ...tp, status } : null);

    this.traineeProblemsService
      .updateStatus(this.groupId(), this.problemId(), { status })
      .subscribe({
        next: () => {
          this.isUpdatingStatus.set(false);
          this.loadTraineeTrackingData();
        },
        error: (err) => {
          this.isUpdatingStatus.set(false);
          this.loadTraineeTrackingData();
          alert(err?.error?.detail || err?.error?.message || 'Failed to update status');
        }
      });
  }

  onSubmitSolution(): void {
    const tp = this.traineeProblem();
    if (!tp || !tp.id || this.submissionForm.invalid) {
      this.submissionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.submissionForm.value;
    const payload = {
      codeLink: formValue.codeLink,
      verdict: +formValue.verdict,
      notes: formValue.notes || null
    };

    this.submissionsService.addSubmission(tp.id, payload).subscribe({
      next: (newSub: any) => {
        this.isSubmitting.set(false);
        const created = newSub?.value || newSub;
        this.submissions.update(list => [created, ...list]);
        this.submissionForm.reset({ verdict: SubmissionVerdict.Accepted });

        // تحديث فوري للحالة والعداد عند قبول الحل
        if (+payload.verdict === +SubmissionVerdict.Accepted) {
          this.traineeProblem.update(curr => curr ? {
            ...curr,
            status: ProblemStatus.Successful,
            lastStartedAt: null
          } : null);
          this.stopLocalTimer();
          this.loadTotalMinutes();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to submit solution');
      }
    });
  }

  onDeleteSubmission(id: number): void {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    this.submissionsService.deleteSubmission(id).subscribe({
      next: () => {
        this.submissions.update(list => list.filter(s => s.id !== id));
      },
      error: (err) => alert(err?.error?.detail || err?.error?.message || 'Failed to delete submission')
    });
  }

  getVerdictName(verdict: SubmissionVerdict | number): string {
    const map: Record<number, string> = {
      [SubmissionVerdict.Accepted]: 'Accepted',
      [SubmissionVerdict.WrongAnswer]: 'Wrong Answer',
      [SubmissionVerdict.TimeLimitExceeded]: 'Time Limit Exceeded',
      [SubmissionVerdict.MemoryLimitExceeded]: 'Memory Limit Exceeded',
      [SubmissionVerdict.CompilationError]: 'Compilation Error',
      [SubmissionVerdict.RuntimeError]: 'Runtime Error'
    };
    return map[verdict as number] || 'Accepted';
  }

  getVerdictClass(verdict: SubmissionVerdict | number): string {
    switch (+verdict) {
      case SubmissionVerdict.Accepted: return 'verdict-ac';
      case SubmissionVerdict.WrongAnswer: return 'verdict-wa';
      case SubmissionVerdict.TimeLimitExceeded: return 'verdict-tle';
      default: return 'verdict-err';
    }
  }

  getDifficultyName(diff?: Difficulty | number): string {
    if (diff === undefined || diff === null) return 'Problem';
    const map: Record<number, string> = {
      [Difficulty.Easy]: 'Easy',
      [Difficulty.Medium]: 'Medium',
      [Difficulty.Hard]: 'Hard'
    };
    return map[diff as number] || 'Easy';
  }

  getStatusClass(status?: ProblemStatus | string | number): string {
    if (status === undefined || status === null) return 'status-not-started';
    const s = status.toString().toLowerCase();
    if (s === '3' || s === 'successful' || s === 'solved') return 'status-solved';
    if (s === '1' || s === 'inprogress') return 'status-in-progress';
    return 'status-not-started';
  }

  getStatusText(status?: ProblemStatus | string | number): string {
    if (status === undefined || status === null) return 'Not Started';
    const s = status.toString().toLowerCase();
    if (s === '3' || s === 'successful' || s === 'solved') return 'Successful';
    if (s === '1' || s === 'inprogress') return 'In Progress';
    return 'Not Started';
  }
}