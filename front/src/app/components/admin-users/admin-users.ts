import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserProfile, UserService } from '../../services/user.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-admin-users',
  styleUrl: './admin-users.css',
  templateUrl: './admin-users.html',
})
export class AdminUsers implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly users = signal<UserProfile[]>([]);
  readonly isLoading = signal(true);
  readonly deletingId = signal<string | number | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  deleteUser(user: UserProfile): void {
    if (user.isAdmin || this.deletingId() !== null) {
      return;
    }
    if (!window.confirm(`Supprimer le compte de ${user.prenom} ${user.nom} ?`)) {
      return;
    }

    this.deletingId.set(user.id);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.users.update((users) => users.filter((item) => item.id !== user.id));
        this.deletingId.set(null);
        this.successMessage.set(`Le compte « ${user.login} » a été supprimé.`);
      },
      error: (error: unknown) => {
        this.deletingId.set(null);
        this.showError(error, 'Impossible de supprimer ce compte.');
      },
    });
  }

  private loadUsers(): void {
    this.userService.list().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.showError(error, 'Impossible de charger les comptes.');
      },
    });
  }

  private showError(error: unknown, fallback: string): void {
    if (
      error instanceof HttpErrorResponse &&
      (error.status === 401 || error.status === 403)
    ) {
      this.userService.endSession();
      void this.router.navigateByUrl('/login');
      return;
    }

    const message =
      error instanceof HttpErrorResponse ? error.error?.message : null;
    this.errorMessage.set(typeof message === 'string' ? message : fallback);
  }
}
