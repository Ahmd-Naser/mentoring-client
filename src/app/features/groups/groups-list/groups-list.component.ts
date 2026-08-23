import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupsService } from '../../../core/services/groups.service';
import { AuthService } from '../../../core/services/auth.service';
import { GroupResponse } from '../../../core/models/group.models';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';


@Component({
  selector: 'app-groups-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NavbarComponent],
  templateUrl: './groups-list.component.html',
  styleUrl: './groups-list.component.scss'
})
export class GroupsListComponent implements OnInit {
  private groupsService = inject(GroupsService);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);

  groups = signal<GroupResponse[]>([]);
  isLoading = signal<boolean>(true);
  isCreating = signal<boolean>(false);
  showCreateModal = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  currentUser = this.authService.currentUser;

  createGroupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(500)]]
  });

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.groupsService.getAll().subscribe({
      next: (data) => {
        this.groups.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load groups. Please try again later.');
      }
    });
  }

  openModal(): void {
    this.createGroupForm.reset();
    this.showCreateModal.set(true);
  }

  closeModal(): void {
    this.showCreateModal.set(false);
  }

  onCreateSubmit(): void {
    if (this.createGroupForm.invalid) {
      this.createGroupForm.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);

    this.groupsService.create(this.createGroupForm.value).subscribe({
      next: (newGroup) => {
        // إضافة المجموعة المنشأة محلياً دون الحاجة لإعادة تحميل القائمة
        this.groups.update((prev) => [newGroup, ...prev]);
        this.isCreating.set(false);
        this.closeModal();
      },
      error: () => {
        this.isCreating.set(false);
        alert('Failed to create group. Please try again.');
      }
    });
  }

  // تحديد هل المستخدم الحالي هو مرشد/مالك هذا الجروب
  isGroupOwner(group: GroupResponse): boolean {
    return group.ownerId === this.currentUser()?.id;
  }
}