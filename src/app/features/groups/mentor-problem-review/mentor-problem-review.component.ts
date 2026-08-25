import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { TraineeProblemsService } from '../../../core/services/trainee-problems.service';
import { ProblemsService } from '../../../core/services/problems.service';
import { GroupsService } from '../../../core/services/groups.service';
import { ProblemResponse } from '../../../core/models/problem.models';
import { GroupDetailsResponse } from '../../../core/models/group.models';
import { TraineeProblemReviewResponse, SubmissionResponse } from '../../../core/models/trainee-problem.models';
import { ProblemStatus, SubmissionVerdict } from '../../../core/models/enums';

@Component({
  selector: 'app-mentor-problem-review',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, NavbarComponent],
  templateUrl: './mentor-problem-review.component.html',
  styleUrl: './mentor-problem-review.component.scss' 
})
export class MentorProblemReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private traineeProblemsService = inject(TraineeProblemsService);
  private problemsService = inject(ProblemsService);
  private groupsService = inject(GroupsService);

  groupId = signal<number>(0);
  problemId = signal<number>(0);

  group = signal<GroupDetailsResponse | null>(null);
  problem = signal<ProblemResponse | null>(null);
  reviews = signal<TraineeProblemReviewResponse[]>([]);
  isLoading = signal<boolean>(true);

  // فلترة المتدربين
  selectedFilter = signal<'all' | 'solved' | 'inprogress' | 'notopened'>('all');
  searchQuery = signal<string>('');

  // نافذة استعراض الحلول التفصيلية لمتدرب
  activeTraineeSubmissions = signal<TraineeProblemReviewResponse | null>(null);

  ProblemStatus = ProblemStatus;
  SubmissionVerdict = SubmissionVerdict;

  // الإحصائيات العامة
  stats = computed(() => {
    const list = this.reviews();
    const total = list.length;
    const solved = list.filter(r => this.isSolved(r.status)).length;
    const inProgress = list.filter(r => this.isInProgress(r.status)).length;
    const notOpened = list.filter(r => !this.isSolved(r.status) && !this.isInProgress(r.status)).length;
    const totalMinutes = list.reduce((acc, curr) => acc + curr.totalMinutes, 0);
    const avgMinutes = total > 0 ? Math.round(totalMinutes / total) : 0;

    return { total, solved, inProgress, notOpened, avgMinutes };
  });

  // قائمة المتدربين بعد الفلترة والبحث
  filteredReviews = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.selectedFilter();

    return this.reviews().filter(r => {
      const nameMatch = r.traineeName.toLowerCase().includes(query) || r.traineeEmail.toLowerCase().includes(query);
      
      let statusMatch = true;
      if (filter === 'solved') statusMatch = this.isSolved(r.status);
      else if (filter === 'inprogress') statusMatch = this.isInProgress(r.status);
      else if (filter === 'notopened') statusMatch = !this.isSolved(r.status) && !this.isInProgress(r.status);

      return nameMatch && statusMatch;
    });
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

    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.groupsService.getById(this.groupId()).subscribe({
      next: (res: any) => this.group.set(res?.value || res),
      error: (err) => console.error('Failed to load group details', err)
    });

    this.problemsService.getById(this.problemId()).subscribe({
      next: (res: any) => this.problem.set(res?.value || res),
      error: (err) => console.error('Failed to load problem details', err)
    });

    this.traineeProblemsService.getProblemReviews(this.groupId(), this.problemId()).subscribe({
      next: (res: any) => {
        const list = res?.value || res;
        this.reviews.set(Array.isArray(list) ? list : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.isLoading.set(false);
      }
    });
  }

  openSubmissionsModal(traineeReview: TraineeProblemReviewResponse): void {
    this.activeTraineeSubmissions.set(traineeReview);
  }

  closeSubmissionsModal(): void {
    this.activeTraineeSubmissions.set(null);
  }

  isSolved(status: ProblemStatus | string | number): boolean {
    const s = status?.toString().toLowerCase();
    return s === '3' || s === 'successful' || s === 'solved';
  }

  isInProgress(status: ProblemStatus | string | number): boolean {
    const s = status?.toString().toLowerCase();
    return s === '1' || s === 'inprogress';
  }

  getStatusText(status: ProblemStatus | string | number): string {
    if (this.isSolved(status)) return 'Solved';
    if (this.isInProgress(status)) return 'In Progress';
    return 'Not Opened';
  }

  getStatusClass(status: ProblemStatus | string | number): string {
    if (this.isSolved(status)) return 'status-solved';
    if (this.isInProgress(status)) return 'status-in-progress';
    return 'status-not-opened';
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
}