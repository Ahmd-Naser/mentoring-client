import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupsService } from '../../../core/services/groups.service';
import { ProblemsService } from '../../../core/services/problems.service';
import { AuthService } from '../../../core/services/auth.service';
import { GroupProblemResponse, GroupResponse, TraineeDataResponse } from '../../../core/models/group.models';
import { ProblemResponse } from '../../../core/models/problem.models';
import { Difficulty } from '../../../core/models/enums';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NavbarComponent],
  templateUrl: './group-details.component.html',
  styleUrl: './group-details.component.scss'
})
export class GroupDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private groupsService = inject(GroupsService);
  private problemsService = inject(ProblemsService);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);

  Difficulty = Difficulty;

  groupId = signal<number | null>(null);
  group = signal<GroupResponse | null>(null);
  trainees = signal<TraineeDataResponse[]>([]);
  groupProblems = signal<GroupProblemResponse[]>([]);
  availableProblems = signal<ProblemResponse[]>([]);

  isLoading = signal<boolean>(true);
  isAddingTrainee = signal<boolean>(false);
  isAddingProblem = signal<boolean>(false);

  showAddTraineeModal = signal<boolean>(false);
  showAddProblemModal = signal<boolean>(false);
  activeTab = signal<'overview' | 'trainees' | 'problems'>('overview');

  currentUser = this.authService.currentUser;

  isOwner = computed(() => {
    const currentGroup = this.group();
    const user = this.currentUser();
    return !!(currentGroup && user && currentGroup.ownerId === user.id);
  });

  addTraineeForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  addProblemForm: FormGroup = this.fb.group({
    problemId: ['', [Validators.required]],
    deadline: ['']
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.groupId.set(id);
      this.loadGroupData(id);
    }
  }

  loadGroupData(id: number): void {
    this.isLoading.set(true);

    this.groupsService.getById(id).subscribe({
      next: (groupData) => {
        this.group.set(groupData);
        this.isLoading.set(false);
        this.loadTrainees(id);
        this.loadGroupProblems(id);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadTrainees(id: number): void {
    this.groupsService.getTrainees(id).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.value || [];
        this.trainees.set(list);
      },
      error: (err) => console.error('Failed to load trainees', err)
    });
  }

  loadGroupProblems(id: number): void {
    this.groupsService.getGroupProblems(id).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.value || [];
        this.groupProblems.set(list);
      },
      error: (err) => console.error('Failed to load group problems', err)
    });
  }

  // ================= Trainee Modal =================
  openAddTraineeModal(): void {
    this.addTraineeForm.reset();
    this.showAddTraineeModal.set(true);
  }

  closeAddTraineeModal(): void {
    this.showAddTraineeModal.set(false);
  }

  onAddTraineeSubmit(): void {
    if (this.addTraineeForm.invalid || !this.groupId()) return;

    this.isAddingTrainee.set(true);

    this.groupsService.addTrainee(this.groupId()!, this.addTraineeForm.value).subscribe({
      next: () => {
        this.isAddingTrainee.set(false);
        this.closeAddTraineeModal();
        this.loadTrainees(this.groupId()!);
      },
      error: (err) => {
        this.isAddingTrainee.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to add trainee');
      }
    });
  }

  // ================= Problem Modal =================
  openAddProblemModal(): void {
    this.addProblemForm.reset();
    this.showAddProblemModal.set(true);

    // جلب بنك المسائل ليختار منها المرشد
    if (this.availableProblems().length === 0) {
      this.problemsService.getAll().subscribe({
        next: (data) => this.availableProblems.set(data),
        error: (err) => console.error('Failed to load problems bank', err)
      });
    }
  }

  closeAddProblemModal(): void {
    this.showAddProblemModal.set(false);
  }

  onAddProblemSubmit(): void {
    if (this.addProblemForm.invalid || !this.groupId()) return;

    this.isAddingProblem.set(true);
    const { problemId, deadline } = this.addProblemForm.value;

    const payload = {
      problemId: Number(problemId),
      deadline: deadline ? new Date(deadline).toISOString() : null
    };

    this.groupsService.addProblemToGroup(this.groupId()!, payload).subscribe({
      next: () => {
        this.isAddingProblem.set(false);
        this.closeAddProblemModal();
        this.loadGroupProblems(this.groupId()!);
        this.loadGroupData(this.groupId()!);
      },
      error: (err) => {
        this.isAddingProblem.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to assign problem to group');
      }
    });
  }

  getDifficultyClass(diff: Difficulty): string {
    switch (diff) {
      case Difficulty.Easy: return 'diff-easy';
      case Difficulty.Medium: return 'diff-medium';
      case Difficulty.Hard: return 'diff-hard';
      default: return '';
    }
  }

  getDifficultyName(diff: Difficulty): string {
    switch (diff) {
      case Difficulty.Easy: return 'Easy';
      case Difficulty.Medium: return 'Medium';
      case Difficulty.Hard: return 'Hard';
      default: return 'Unknown';
    }
  }
}