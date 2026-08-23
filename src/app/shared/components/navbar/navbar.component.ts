import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  public authService = inject(AuthService);

  // قراءة المستخدم الحالي مباشرة من الـ Signal
  currentUser = this.authService.currentUser;

  onLogout(): void {
    this.authService.logout();
  }
}