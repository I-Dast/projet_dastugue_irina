export const TYPES_POLLUTION = [
  'Plastique',
  'Chimique',
  'Dépôt sauvage',
  'Eau',
  'Air',
  'Autre',
] as const;

export type TypePollution = (typeof TYPES_POLLUTION)[number];

export interface Pollution {
  id?: number | string;
  titreDeclarationDePollution: string;
  typePollution: TypePollution;
  description: string;
  dateObservation: string;
  lieu: string;
  latitude: number;
  longitude: number;
  photoUrl: string;
}
