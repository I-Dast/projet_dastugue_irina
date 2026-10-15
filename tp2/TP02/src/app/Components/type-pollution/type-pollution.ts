import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const TYPES_POLLUTION = [
  'Plastique',
  'Chimique',
  'Dépôt sauvage',
  'Eau',
  'Air',
  'Autre',
] as const;

export type TypePollutionOption = (typeof TYPES_POLLUTION)[number];

@Component({
  imports: [],
  selector: 'app-type-pollution',
  styleUrl: './type-pollution.css',
  templateUrl: './type-pollution.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypePollution),
      multi: true,
    },
  ],
})
export class TypePollution implements ControlValueAccessor {
  readonly types = TYPES_POLLUTION;
  value: TypePollutionOption | '' = '';
  disabled = false;

  private onChange: (value: TypePollutionOption | '') => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: TypePollutionOption | null): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: TypePollutionOption | '') => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      this.updateValue(target.value);
    }
  }

  markAsTouched(): void {
    this.onTouched();
  }

  private updateValue(value: string): void {
    const selectedType = this.types.find((type) => type === value);
    if (selectedType) {
      this.value = selectedType;
      this.onChange(selectedType);
    } else {
      this.value = '';
      this.onChange('');
    }
  }
}
