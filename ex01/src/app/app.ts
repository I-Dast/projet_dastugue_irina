import { Component } from '@angular/core';
import { AppUserProfile } from './app-user-profile/app-user-profile';

@Component({
  imports: [AppUserProfile],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
