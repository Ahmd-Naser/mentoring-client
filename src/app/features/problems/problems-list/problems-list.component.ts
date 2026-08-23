import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProblemsService } from '../../../core/services/problems.service';
import { CreateProblemRequest, ProblemResponse } from '../../../core/models/problem.models';
import { Difficulty } from '../../../core/models/enums';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

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

  Difficulty = Difficulty;

  problems = signal<ProblemResponse[]>([]);
  isLoading = signal<boolean>(true);
  isCreating = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  searchQuery = signal<string>('');
  selectedDifficulty = signal<number | null>(null);

  filteredProblems = computed(() => {
    let list = this.problems();
    const query = this.searchQuery().toLowerCase().trim();
    const diff = this.selectedDifficulty();

    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query));
    }

    if (diff !== null) {
      list = list.filter((p) => p.difficulty === diff);
    }

    return list;
  });

  // 🌟 تحديث النموذج لدعم link و notes
  createProblemForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    link: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
    notes: [''],
    difficulty: [Difficulty.Easy, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadProblems();
  }

  loadProblems(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.problemsService.getAll().subscribe({
      next: (data) => {
        this.problems.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load problems.');
      }
    });
  }

  openCreateModal(): void {
    this.createProblemForm.reset({ difficulty: Difficulty.Easy, notes: '' });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onCreateSubmit(): void {
    if (this.createProblemForm.invalid) {
      this.createProblemForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);
    const formValue = this.createProblemForm.value;

    const payload: CreateProblemRequest = {
      name: formValue.name,
      link: formValue.link,
      notes: formValue.notes ? formValue.notes.trim() : undefined,
      difficulty: Number(formValue.difficulty)
    };

    this.problemsService.create(payload).subscribe({
      next: (newProb) => {
        this.problems.update((prev) => [newProb, ...prev]);
        this.isCreating.set(false);
        this.closeCreateModal();
      },
      error: (err) => {
        this.isCreating.set(false);
        alert(err?.error?.detail || err?.error?.message || 'Failed to create problem.');
      }
    });
  }

  getDifficultyName(diff: Difficulty): string {
    switch (diff) {
      case Difficulty.Easy: return 'Easy';
      case Difficulty.Medium: return 'Medium';
      case Difficulty.Hard: return 'Hard';
      default: return 'Unknown';
    }
  }

  getDifficultyClass(diff: Difficulty): string {
    switch (diff) {
      case Difficulty.Easy: return 'diff-easy';
      case Difficulty.Medium: return 'diff-medium';
      case Difficulty.Hard: return 'diff-hard';
      default: return '';
    }
  }
}