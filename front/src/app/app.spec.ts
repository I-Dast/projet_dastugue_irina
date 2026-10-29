<<<<<<< HEAD
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
=======
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
>>>>>>> 1e85533251dc9f86d7a4706aefe60ae74d3fb02e
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
<<<<<<< HEAD
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app and render the signup form', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('app-signup'),
    ).toBeTruthy();
=======
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
>>>>>>> 1e85533251dc9f86d7a4706aefe60ae74d3fb02e
  });
});
