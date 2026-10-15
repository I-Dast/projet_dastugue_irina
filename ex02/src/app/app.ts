import { Component } from '@angular/core';
import { Signup } from './components/signup/signup';

@Component({
  // Importe le composant d'inscription afin que <app-signup> soit disponible dans le template.
  imports: [Signup],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
