import { Component } from '@angular/core';
import { Signup } from './components/signup/signup';

@Component({
  imports: [Signup],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
