import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HighlightPollutionDirective } from './highlight-pollution.directive';

@Component({
  imports: [HighlightPollutionDirective],
  template: '<div [appHighlightPollution]="indice"></div>',
})
class TestHost {
  indice: number | undefined = 0;
}

describe('HighlightPollutionDirective', () => {
  it.each([
    [0, 'lightgreen'],
    [20, 'lightgreen'],
    [21, 'yellow'],
    [50, 'yellow'],
    [51, 'orange'],
    [100, 'orange'],
    [101, 'red'],
  ])('should apply %s background for index %i', (indice, expectedColor) => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.indice = indice;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('div').style.backgroundColor).toBe(expectedColor);
  });

  it('should remove the background when the index is unavailable', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.indice = undefined;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('div').style.backgroundColor).toBe('');
  });
});
