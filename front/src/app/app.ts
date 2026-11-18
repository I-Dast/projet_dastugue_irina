import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  readonly userService = inject(UserService);
  private readonly router = inject(Router);
  readonly logoutWaveVisible = signal(false);
  readonly logoutWaveX = signal(0);
  readonly logoutWaveY = signal(0);

  logout(): void {
    this.userService.endSession();
    void this.router.navigateByUrl('/login');
  }

  showLogoutWave(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') {
      return;
    }

    this.updateLogoutWavePosition(event);
    this.logoutWaveVisible.set(true);
  }

  moveLogoutWave(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && this.logoutWaveVisible()) {
      this.updateLogoutWavePosition(event);
    }
  }

  hideLogoutWave(): void {
    this.logoutWaveVisible.set(false);
  }

  private updateLogoutWavePosition(event: PointerEvent): void {
    this.logoutWaveX.set(Math.max(12, event.clientX - 48));
    this.logoutWaveY.set(Math.max(12, event.clientY + 16));
  }

  updateBackgroundPointer(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      return;
    }

    const shell = event.currentTarget;
    if (!(shell instanceof HTMLElement)) {
      return;
    }

    shell.style.setProperty('--pointer-x', `${event.clientX}px`);
    shell.style.setProperty('--pointer-y', `${event.clientY}px`);
  }

  resetBackgroundPointer(event: PointerEvent): void {
    const shell = event.currentTarget;
    if (!(shell instanceof HTMLElement)) {
      return;
    }

    shell.style.setProperty('--pointer-x', '-1000px');
    shell.style.setProperty('--pointer-y', '-1000px');
  }
}
