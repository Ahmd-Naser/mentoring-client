import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProblemsService } from '../../../core/services/problems.service';
import { TraineeProblemsService } from '../../../core/services/trainee-problems.service';
import { SubmissionsService } from '../../../core/services/submissions.service';
import { ProblemResponse } from '../../../core/models/problem.models';
import {
  SubmissionRequest,
  SubmissionResponse,
  TraineeProblemResponse
} from '../../../core/models/workspace.models';
import { Difficulty, ProblemStatus, SubmissionVerdict } from '../../../core/models/enums';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-problem-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NavbarComponent, FormsModule],
  templateUrl: './problem-workspace.component.html',
  styleUrl: './problem-workspace.component.scss'
})
export class ProblemWorkspaceComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private problemsService = inject(ProblemsService);
  private traineeProblemsService = inject(TraineeProblemsService);
  private submissionsService = inject(SubmissionsService);

  // Enums
  Difficulty = Difficulty;
  ProblemStatus = ProblemStatus;
  SubmissionVerdict = SubmissionVerdict;

  groupId = signal<number>(0);
  problemId = signal<number>(0);

  problem = signal<ProblemResponse | null>(null);
  traineeProblem = signal<TraineeProblemResponse | null>(null);
  totalMinutes = signal<number>(0);
  submissions = signal<SubmissionResponse[]>([]);

  // مؤقت الجلسة الحية (Live Timer)
  activeSessionSeconds = signal<number>(0);
  private timerInterval: any = null;

  isLoading = signal<boolean>(true);
  isStarting = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isUpdatingStatus = signal<boolean>(false);

  // نافذة تعديل Submission
  editingSubmission = signal<SubmissionResponse | null>(null);

  // النماذج
  submissionForm: FormGroup = this.fb.group({
    codeLink: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    verdict: [SubmissionVerdict.Accepted, [Validators.required]],
    notes: ['']
  });

  statusForm: FormGroup = this.fb.group({
    status: [ProblemStatus.InProgress, [Validators.required]]
  });

  // هل بدأت المسألة مسبقاً أم لا؟
  isStarted = computed(() => !!this.traineeProblem());

  ngOnInit(): void {
    const gId = Number(this.route.snapshot.paramMap.get('groupId'));
    const pId = Number(this.route.snapshot.paramMap.get('problemId'));

    if (gId && pId) {
      this.groupId.set(gId);
      this.problemId.set(pId);
      this.loadInitialData();
    }
  }

  ngOnDestroy(): void {
    this.stopLiveTimer();
  }

  loadInitialData(): void {
    this.isLoading.set(true);
    const gId = this.groupId();
    const pId = this.problemId();

    // 1. جلب بيانات المسألة
    this.problemsService.getById(pId).subscribe({
      next: (p) => this.problem.set(p),
      error: (err) => console.error('Failed to load problem metadata', err)
    });

    // 2. فحص حالة المتدرب مع هذه المسألة
    this.traineeProblemsService.getTraineeProblem(gId, pId).subscribe({
      next: (tp) => {
        this.traineeProblem.set(tp);
        this.statusForm.patchValue({ status: tp.status });
        this.loadTotalMinutes();
        this.loadSubmissions(tp.id);
        this.handleSessionTimer(tp.lastStartedAt);
        this.isLoading.set(false);
      },
      error: (err) => {
        // 404 تعني أن المتدرب لم يضغط Start بعد
        this.traineeProblem.set(null);
        this.isLoading.set(false);
      }
    });
  }

  loadTotalMinutes(): void {
    this.traineeProblemsService.getTotalMinutesSpent(this.groupId(), this.problemId()).subscribe({
      next: (res) => this.totalMinutes.set(res.minutes),
      error: () => this.totalMinutes.set(0)
    });
  }

  loadSubmissions(tpId: number): void {
    this.submissionsService.getAllForTraineeProblem(tpId).subscribe({
      next: (subs) => this.submissions.set(subs || []),
      error: (err) => console.error('Failed to load submissions', err)
    });
  }

  // بدء حل المسألة (POST /start)
  onStartProblem(): void {
    this.isStarting.set(true);
    this.traineeProblemsService.startProblem(this.groupId(), this.problemId()).subscribe({
      next: (tp) => {
        this.traineeProblem.set(tp);
        this.statusForm.patchValue({ status: tp.status });
        this.handleSessionTimer(tp.lastStartedAt);
        this.loadSubmissions(tp.id);
        this.isStarting.set(false);
      },
      error: (err) => {
        this.isStarting.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to start problem session');
      }
    });
  }

  // تحديث الحالة وتثبيت جلسة الوقت (PUT /TraineeProblems)
  onUpdateStatus(): void {
    if (!this.traineeProblem()) return;

    this.isUpdatingStatus.set(true);
    const req = { status: Number(this.statusForm.value.status) };

    this.traineeProblemsService.updateTraineeProblem(this.groupId(), this.problemId(), req).subscribe({
      next: () => {
        this.isUpdatingStatus.set(false);
        this.stopLiveTimer();
        // إعادة قراءة الحالة والدقائق المحدثة من السيرفر
        this.loadInitialData();
        alert('Session updated successfully!');
      },
      error: (err) => {
        this.isUpdatingStatus.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to update problem status');
      }
    });
  }

  // تسجيل تسليم جديد (POST /Submissions)
  onSubmitSolution(): void {
    const tp = this.traineeProblem();
    if (!tp || this.submissionForm.invalid) {
      this.submissionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const req: SubmissionRequest = {
      codeLink: this.submissionForm.value.codeLink.trim(),
      verdict: Number(this.submissionForm.value.verdict),
      notes: this.submissionForm.value.notes ? this.submissionForm.value.notes.trim() : null
    };

    this.submissionsService.createSubmission(tp.id, req).subscribe({
      next: (newSub) => {
        this.submissions.update((prev) => [newSub, ...prev]);
        this.submissionForm.reset({ verdict: SubmissionVerdict.Accepted });
        this.isSubmitting.set(false);

        // إذا كان الحل Accepted، تتغير الحالة تلقائياً في السيرفر
        if (req.verdict === SubmissionVerdict.Accepted) {
          this.loadInitialData();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to record submission');
      }
    });
  }

  // حذف محاولة تسليم
  onDeleteSubmission(subId: number): void {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    this.submissionsService.deleteSubmission(subId).subscribe({
      next: () => {
        this.submissions.update((prev) => prev.filter((s) => s.id !== subId));
      },
      error: (err) => alert(err?.error?.detail || err?.error?.message || 'Failed to delete submission')
    });
  }

  // نافذة تعديل المحاولة
  openEditModal(sub: SubmissionResponse): void {
    this.editingSubmission.set(sub);
  }

  closeEditModal(): void {
    this.editingSubmission.set(null);
  }

  onSaveEditSubmission(subForm: any): void {
    const currentSub = this.editingSubmission();
    if (!currentSub) return;

    this.submissionsService.updateSubmission(currentSub.id, subForm).subscribe({
      next: (updated) => {
        this.submissions.update((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        this.closeEditModal();
      },
      error: (err) => alert(err?.error?.detail || err?.error?.message || 'Failed to update submission')
    });
  }

  // التحكم في عداد الوقت الحي
  private handleSessionTimer(lastStartedAt?: string | null): void {
    this.stopLiveTimer();
    if (!lastStartedAt) {
      this.activeSessionSeconds.set(0);
      return;
    }

    const startTime = new Date(lastStartedAt).getTime();
    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
      this.activeSessionSeconds.set(elapsed);
    }, 1000);
  }

  private stopLiveTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatSeconds(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getStatusName(status: ProblemStatus): string {
    switch (status) {
      case ProblemStatus.InProgress: return 'In Progress';
      case ProblemStatus.Attempted: return 'Attempted';
      case ProblemStatus.Successful: return 'Solved (Successful) ✓';
      default: return 'Not Started';
    }
  }

  getVerdictName(v: SubmissionVerdict): string {
    switch (v) {
      case SubmissionVerdict.Accepted: return 'Accepted';
      case SubmissionVerdict.WrongAnswer: return 'Wrong Answer';
      case SubmissionVerdict.TimeLimitExceeded: return 'Time Limit Exceeded';
      case SubmissionVerdict.MemoryLimitExceeded: return 'Memory Limit Exceeded';
      case SubmissionVerdict.RuntimeError: return 'Runtime Error';
      case SubmissionVerdict.CompilationError: return 'Compilation Error';
      default: return 'Unknown';
    }
  }

  getVerdictClass(v: SubmissionVerdict): string {
    switch (v) {
      case SubmissionVerdict.Accepted: return 'v-ac';
      case SubmissionVerdict.WrongAnswer: return 'v-wa';
      case SubmissionVerdict.TimeLimitExceeded: return 'v-tle';
      default: return 'v-other';
    }
  }
}