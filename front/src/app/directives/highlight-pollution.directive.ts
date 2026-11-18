import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlightPollution]',
  standalone: true,
})
export class HighlightPollutionDirective {
  @Input({ required: true })
  set appHighlightPollution(indice: number | undefined) {
    const color = this.getBackgroundColor(indice);
    if (color) {
      this.renderer.setStyle(this.element.nativeElement, 'background-color', color);
    } else {
      this.renderer.removeStyle(this.element.nativeElement, 'background-color');
    }
  }

  constructor(
    private readonly element: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  private getBackgroundColor(indice: number | undefined): string | null {
    if (indice === undefined || !Number.isFinite(indice) || indice < 0) {
      return null;
    }
    if (indice <= 20) {
      return 'lightgreen';
    }
    if (indice <= 50) {
      return 'yellow';
    }
    if (indice <= 100) {
      return 'orange';
    }
    return 'red';
  }
}
