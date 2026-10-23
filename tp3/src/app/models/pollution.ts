/** Valeurs autorisées pour le type ; « as const » permet de les valider aussi par TypeScript. */
export const TYPES_POLLUTION = [
  'Plastique',
  'Chimique',
  'Dépôt sauvage',
  'Eau',
  'Air',
  'Autre',
] as const;

export type TypePollution = (typeof TYPES_POLLUTION)[number];

/** Structure commune utilisée par le formulaire, les vues et les réponses de l’API. */
export interface Pollution {
  /** Créé par le serveur ; absent tant qu’une nouvelle pollution n’a pas été enregistrée. */
  id?: number | string;
  /** Titre visible dans la liste, le détail et le récapitulatif. */
  titreDeclarationDePollution: string;
  /** Catégorie choisie parmi TYPES_POLLUTION. */
  typePollution: TypePollution;
  /** Texte descriptif saisi par l’utilisateur. */
  description: string;
  /** Date au format ISO AAAA-MM-JJ, fourni par un input de type date. */
  dateObservation: string;
  /** Nom du lieu saisi ; ce champ est distinct des coordonnées GPS. */
  lieu: string;
  /** Latitude décimale, comprise entre -90 et 90. */
  latitude: number;
  /** Longitude décimale, comprise entre -180 et 180. */
  longitude: number;
  /** URL facultative de la photo associée à la déclaration. */
  photoUrl: string;
}
