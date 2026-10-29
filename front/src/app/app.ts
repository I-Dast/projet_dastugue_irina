import { Component } from '@angular/core';
<<<<<<< HEAD
import { Signup } from './components/signup/signup';

@Component({
  imports: [Signup],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
=======
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
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
>>>>>>> 1e85533251dc9f86d7a4706aefe60ae74d3fb02e
