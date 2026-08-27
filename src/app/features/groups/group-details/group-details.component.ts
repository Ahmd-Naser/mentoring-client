import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { GroupsService } from '../../../core/services/groups.service';
import { ProblemsService } from '../../../core/services/problems.service';
import { AuthService } from '../../../core/services/auth.service';

import {
  GroupDetailsResponse,
  GroupProblemResponse,
  TraineeInGroupResponse
} from '../../../core/models/group.models';
import { ProblemResponse } from '../../../core/models/problem.models';
import { Difficulty } from '../../../core/models/enums';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    DatePipe,
    UpperCasePipe,
    NavbarComponent
  ],
  templateUrl: './group-details.component.html',
  styleUrl: './group-details.component.scss'
})
export class GroupDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private groupsService = inject(GroupsService);
  private problemsService = inject(ProblemsService);
  private authService = inject(AuthService);

  // States
  groupId = signal<number>(0);
  group = signal<GroupDetailsResponse | null>(null);
  trainees = signal<TraineeInGroupResponse[]>([]);
  groupProblems = signal<GroupProblemResponse[]>([]);
  availableProblems = signal<ProblemResponse[]>([]);

  isLoading = signal<boolean>(true);
  activeTab = signal<'overview' | 'trainees' | 'problems'>('problems');

  // Modals Visibility
  showEditGroupModal = signal<boolean>(false);
  showAddTraineeModal = signal<boolean>(false);
  showAddProblemModal = signal<boolean>(false);

  // Loading flags for actions
  isSavingGroup = signal<boolean>(false);
  isAddingTrainee = signal<boolean>(false);
  isAddingProblem = signal<boolean>(false);

  // Mentor/Owner Check
  isOwner = computed(() => {
    const user = this.authService.currentUser();
    const g = this.group();
    if (!user || !g) return false;
    const currentUserId = user.id || (user as any).userId;
    return currentUserId === g.ownerId;
  });

  // Forms
  editGroupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]]
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
    if (!idParam || isNaN(+idParam)) {
      this.router.navigate(['/groups']);
      return;
    }

    this.groupId.set(+idParam);
    this.loadGroupData();
  }

  loadGroupData(): void {
    const id = this.groupId();
    this.isLoading.set(true);

    this.groupsService.getById(id).subscribe({
      next: (res: any) => {
        const groupData = res?.value || res;
        this.group.set(groupData);
        this.loadTrainees();
        this.loadProblems();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load group details', err);
        this.isLoading.set(false);
        alert('Failed to load group details.');
        this.router.navigate(['/groups']);
      }
    });
  }

  loadTrainees(): void {
    this.groupsService.getTrainees(this.groupId()).subscribe({
      next: (res: any) => {
        const list = res?.value || res;
        this.trainees.set(Array.isArray(list) ? list : []);
      },
      error: (err) => console.error('Failed to load trainees', err)
    });
  }

  loadProblems(): void {
    this.groupsService.getProblems(this.groupId()).subscribe({
      next: (res: any) => {
        const list = res?.value || res;
        this.groupProblems.set(Array.isArray(list) ? list : []);
      },
      error: (err) => console.error('Failed to load group problems', err)
    });
  }

  // --- Group Actions (Edit & Delete) ---
  openEditGroupModal(): void {
    const g = this.group();
    if (!g) return;

    this.editGroupForm.patchValue({
      name: g.name,
      description: g.description || ''
    });
    this.showEditGroupModal.set(true);
  }

  closeEditGroupModal(): void {
    this.showEditGroupModal.set(false);
  }

  onSaveGroupChanges(): void {
    if (this.editGroupForm.invalid || !this.group()) {
      this.editGroupForm.markAllAsTouched();
      return;
    }

    this.isSavingGroup.set(true);
    const updatedValues = this.editGroupForm.value;

    this.groupsService.update(this.groupId(), updatedValues).subscribe({
      next: () => {
        this.isSavingGroup.set(false);
        this.group.update(curr => curr ? { ...curr, ...updatedValues } : null);
        this.closeEditGroupModal();
        alert('Group updated successfully!');
      },
      error: (err) => {
        this.isSavingGroup.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to update group');
      }
    });
  }

  onDeleteGroup(): void {
    const g = this.group();
    if (!g) return;

    if (!confirm(`Are you sure you want to permanently delete the group "${g.name}"?`)) return;

    this.groupsService.delete(g.id).subscribe({
      next: () => {
        alert('Group deleted successfully.');
        this.router.navigate(['/groups']);
      },
      error: (err) => alert(err?.error?.detail || err?.error?.message || 'Failed to delete group')
    });
  }

  // --- Trainee Actions ---
  openAddTraineeModal(): void {
    this.addTraineeForm.reset();
    this.showAddTraineeModal.set(true);
  }

  closeAddTraineeModal(): void {
    this.showAddTraineeModal.set(false);
  }

  onAddTraineeSubmit(): void {
    if (this.addTraineeForm.invalid) {
      this.addTraineeForm.markAllAsTouched();
      return;
    }

    this.isAddingTrainee.set(true);
    const req = { email: this.addTraineeForm.value.email };

    this.groupsService.addTrainee(this.groupId(), req).subscribe({
      next: () => {
        this.isAddingTrainee.set(false);
        this.closeAddTraineeModal();
        this.loadTrainees();
        alert('Trainee added successfully!');
      },
      error: (err) => {
        this.isAddingTrainee.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to add trainee');
      }
    });
  }

  onRemoveTrainee(traineeEmail: string): void {
    if (!confirm(`Remove trainee (${traineeEmail}) from this group?`)) return;

    this.groupsService.removeTrainee(this.groupId(), { email: traineeEmail }).subscribe({
      next: () => {
        this.trainees.update(list => list.filter(t => t.email !== traineeEmail));
      },
      error: (err) => alert(err?.error?.detail || err?.error?.message || 'Failed to remove trainee')
    });
  }

  // --- Problem Actions ---
  openAddProblemModal(): void {
    this.addProblemForm.reset({ problemId: '', deadline: '' });
    this.problemsService.getAll().subscribe({
      next: (res: any) => {
        const list = res?.value || res;
        this.availableProblems.set(Array.isArray(list) ? list : []);
        this.showAddProblemModal.set(true);
      },
      error: (err) => alert('Failed to fetch available problems bank')
    });
  }

  closeAddProblemModal(): void {
    this.showAddProblemModal.set(false);
  }

  onAddProblemSubmit(): void {
  if (this.addProblemForm.invalid) {
    this.addProblemForm.markAllAsTouched();
    return;
  }

  this.isAddingProblem.set(true);
  
  // ✅ استخراج القيمتين معاً
  const formValue = this.addProblemForm.value;
  const payload = {
    problemId: +formValue.problemId,
    deadline: formValue.deadline || null
  };

  this.groupsService.addProblem(this.groupId(), payload).subscribe({
    next: () => {
      this.isAddingProblem.set(false);
      this.closeAddProblemModal();
      this.loadProblems();
      alert('Problem assigned to group successfully!');
    },
    error: (err) => {
      this.isAddingProblem.set(false);
      alert(err?.error?.detail || err?.error?.message || 'Failed to assign problem');
    }
  });
}

  onRemoveProblemFromGroup(problemId: number): void {
    if (!confirm('Remove this problem from the group assignment list?')) return;

    this.groupsService.removeProblem(this.groupId(), problemId).subscribe({
      next: () => {
        this.groupProblems.update(list => list.filter(p => p.problemId !== problemId));
      },
      error: (err) => alert(err?.error?.detail || err?.error?.message || 'Failed to remove problem')
    });
  }

  // --- Helpers ---
  getTraineeDisplayName(trainee: TraineeInGroupResponse): string {
    if (trainee.firstName || trainee.lastName) {
      return `${trainee.firstName || ''} ${trainee.lastName || ''}`.trim();
    }
    return (trainee as any).name || trainee.email;
  }

  getDifficultyName(diff: Difficulty | number): string {
    const map: Record<number, string> = {
      [Difficulty.Easy]: 'Easy',
      [Difficulty.Medium]: 'Medium',
      [Difficulty.Hard]: 'Hard'
    };
    return map[diff as number] || 'Easy';
  }

  getDifficultyClass(diff: Difficulty | number): string {
    const map: Record<number, string> = {
      [Difficulty.Easy]: 'diff-easy',
      [Difficulty.Medium]: 'diff-medium',
      [Difficulty.Hard]: 'diff-hard'
    };
    return map[diff as number] || 'diff-easy';
  }
}