import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TypePollution } from './type-pollution';

describe('TypePollution', () => {
  let component: TypePollution;
  let fixture: ComponentFixture<TypePollution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypePollution],
    }).compileComponents();

    fixture = TestBed.createComponent(TypePollution);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
