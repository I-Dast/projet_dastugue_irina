import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormulaireDeclarerUnePollution } from './Components/formulaire-declarer-une-pollution/formulaire-declarer-une-pollution';

@Component({
  imports: [RouterOutlet, FormulaireDeclarerUnePollution],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('TP02');
}
