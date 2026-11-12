import { PollutionLevelPipe } from './pollution-level.pipe';

describe('PollutionLevelPipe', () => {
  const pipe = new PollutionLevelPipe();

  it.each([
    [0, 'Faible'],
    [20, 'Faible'],
    [21, 'Modérée'],
    [50, 'Modérée'],
    [51, 'Élevée'],
    [100, 'Élevée'],
    [101, 'Dangereuse'],
  ])('should map index %i to %s', (indice, expected) => {
    expect(pipe.transform(indice)).toBe(expected);
  });

  it.each([undefined, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'should report an unavailable level for invalid index %s',
    (indice) => {
      expect(pipe.transform(indice)).toBe('Inconnu');
    },
  );
});
