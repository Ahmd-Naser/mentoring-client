import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { ProblemsService } from '../../../core/services/problems.service';
import { CreateProblemRequest, ProblemResponse } from '../../../core/models/problem.models';
import { Difficulty } from '../../../core/models/enums';

@Component({
  selector: 'app-problems-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './problems-list.component.html',
  styleUrl: './problems-list.component.scss'
})
export class ProblemsListComponent implements OnInit {
  private problemsService = inject(ProblemsService);
  private fb = inject(FormBuilder);

  // States
  problems = signal<ProblemResponse[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);

  // Search & Filter
  searchQuery = signal<string>('');
  selectedDifficulty = signal<string>('all');

  // Modal State
  isModalOpen = signal<boolean>(false);
  editingProblem = signal<ProblemResponse | null>(null);

  Difficulty = Difficulty;

  problemForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    link: ['', [Validators.required, Validators.maxLength(500)]],
    difficulty: [Difficulty.Easy, [Validators.required]],
    notes: ['']
  });

  // Filtered Problems Signal
  filteredProblems = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const diff = this.selectedDifficulty();

    return this.problems().filter(p => {
      const matchesQuery = !query || p.name.toLowerCase().includes(query);
      const matchesDiff = diff === 'all' || p.difficulty.toString() === diff;
      return matchesQuery && matchesDiff;
    });
  });

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.isLoading.set(true);
    this.problemsService.getAll().subscribe({
      next: (res: any) => {
        const list = res?.value || res;
        this.problems.set(Array.isArray(list) ? list : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load problems', err);
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.editingProblem.set(null);
    this.problemForm.reset({
      name: '',
      link: '',
      difficulty: Difficulty.Easy,
      notes: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(problem: ProblemResponse): void {
    this.editingProblem.set(problem);
    this.problemForm.patchValue({
      name: problem.name,
      link: problem.link,
      difficulty: problem.difficulty,
      notes: problem.notes || ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProblem.set(null);
  }

  onSubmit(): void {
    if (this.problemForm.invalid) {
      this.problemForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.problemForm.value;
    const requestPayload: CreateProblemRequest = {
      name: formValue.name,
      link: formValue.link,
      difficulty: +formValue.difficulty,
      notes: formValue.notes || null
    };

    const editTarget = this.editingProblem();

    if (editTarget) {
      // 🔄 Update Existing Problem
      this.problemsService.update(editTarget.id, requestPayload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.problems.update(list =>
            list.map(p => (p.id === editTarget.id ? { ...p, ...requestPayload } : p))
          );
          this.closeModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert(err?.error?.detail || err?.error?.message || 'Failed to update problem.');
        }
      });
    } else {
      // ➕ Create New Problem
      this.problemsService.create(requestPayload).subscribe({
        next: (res: any) => {
          this.isSubmitting.set(false);
          const created = res?.value || res;
          this.problems.update(list => [created, ...list]);
          this.closeModal();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          alert(err?.error?.detail || err?.error?.message || 'Failed to create problem.');
        }
      });
    }
  }

  onDelete(problem: ProblemResponse): void {
    if (!confirm(`Are you sure you want to delete "${problem.name}" from the bank?`)) return;

    this.problemsService.delete(problem.id).subscribe({
      next: () => {
        this.problems.update(list => list.filter(p => p.id !== problem.id));
      },
      error: (err) => {
        alert(err?.error?.detail || err?.error?.message || 'Failed to delete problem.');
      }
    });
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
    switch (+diff) {
      case Difficulty.Easy: return 'diff-easy';
      case Difficulty.Medium: return 'diff-medium';
      case Difficulty.Hard: return 'diff-hard';
      default: return 'diff-easy';
    }
  }
}