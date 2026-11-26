import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { UserService } from './services/user.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the logout icon for a signed-in user and hides it after logout', () => {
    const fixture = TestBed.createComponent(App);
    const users = TestBed.inject(UserService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    users.startSession({
      id: 1,
      login: 'ada',
      nom: 'Lovelace',
      prenom: 'Ada',
      email: 'ada@example.com',
      telephone: '',
      isAdmin: false,
    });
    fixture.detectChanges();

    const button: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.logout-button');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('aria-label')).toBe('Se déconnecter');
    button?.click();
    fixture.detectChanges();

    expect(users.isAuthenticated()).toBe(false);
    expect(fixture.nativeElement.querySelector('.logout-button')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });

  it('shows the waving hand for a mouse hover but not for touch', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.showLogoutWave({
      pointerType: 'mouse',
      clientX: 120,
      clientY: 80,
    } as PointerEvent);
    fixture.detectChanges();

    const hand: HTMLElement | null =
      fixture.nativeElement.querySelector('.logout-wave');
    expect(hand).not.toBeNull();
    expect(hand?.style.left).toBe('72px');
    expect(hand?.style.top).toBe('96px');
    expect(hand?.querySelector('.logout-wave__message')?.textContent).toBe('Bye bye !');

    app.hideLogoutWave();
    app.showLogoutWave({
      pointerType: 'touch',
      clientX: 120,
      clientY: 80,
    } as PointerEvent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.logout-wave')).toBeNull();
  });
});
