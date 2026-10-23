# Guide de navigation dans le code

Ce guide sert de sommaire cliquable pour retrouver les fonctionnalités du TP3.
Les liens pointent vers les fichiers et les lignes où commencer la lecture.
Dans VS Code, cliquez sur un lien pour ouvrir le fichier ; sur GitHub, le lien
affiche directement la ligne correspondante.

## Vue d’ensemble du parcours

1. La page d’accueil affiche le formulaire et charge la liste depuis l’API.
2. La création envoie une requête `POST`, met à jour la liste et affiche un récapitulatif.
3. La liste permet de filtrer, ouvrir un détail et supprimer une pollution.
4. Le détail permet de modifier une pollution avec `PUT` ou de la supprimer avec `DELETE`.

Les composants s’occupent de l’écran et de ses interactions. Les services
encapsulent les communications avec l’API et les fonctionnalités du navigateur.

## Page principale et déclaration

| Sujet | Code à ouvrir | Ce qu’on y trouve |
|---|---|---|
| Composant principal de la liste | [PollutionList, signaux et filtres](./src/app/components/pollution-list/pollution-list.ts#L16) | Classe Angular, services injectés, état réactif et liste calculée. |
| Règles de validation du formulaire | [pollutionForm](./src/app/components/pollution-list/pollution-list.ts#L76) | Champs, types et validateurs requis. |
| Chargement initial | [ngOnInit](./src/app/components/pollution-list/pollution-list.ts#L87) | Appelle l’API au premier affichage et traite succès ou erreur. |
| Création et ouverture du récapitulatif | [addPollution](./src/app/components/pollution-list/pollution-list.ts#L188) | Vérifie le formulaire, envoie `POST`, ajoute la réponse à la liste et ouvre le récapitulatif. |
| Formulaire HTML | [pollution-list.html — déclaration](./src/app/components/pollution-list/pollution-list.html#L9) | `formGroup`, `formControlName`, soumission, erreurs et bouton d’envoi. |
| Bouton de géolocalisation | [pollution-list.html — Utiliser ma position](./src/app/components/pollution-list/pollution-list.html#L103) | Événement `(click)` relié à `locateDevice()`. |
| Style de la page | [pollution-list.css](./src/app/components/pollution-list/pollution-list.css#L1) | Mise en page, charte graphique et adaptation mobile. |

## Étape 4 — modifier une pollution

| Sujet | Code à ouvrir | Ce qu’on y trouve |
|---|---|---|
| Chargement par identifiant | [ngOnInit du détail](./src/app/components/pollution-detail/pollution-detail.ts#L50) | Lit `:id` dans l’URL et demande la pollution à l’API. |
| Formulaire et règles d’édition | [editForm](./src/app/components/pollution-detail/pollution-detail.ts#L39) | Champs prévus pour modifier une déclaration. |
| Préremplissage | [startEditing](./src/app/components/pollution-detail/pollution-detail.ts#L84) | Copie les valeurs affichées dans le formulaire. |
| Annulation | [cancelEditing](./src/app/components/pollution-detail/pollution-detail.ts#L106) | Quitte l’édition sans envoyer de requête. |
| Enregistrement des changements | [saveChanges](./src/app/components/pollution-detail/pollution-detail.ts#L136) | Valide les données et appelle la méthode `PUT`. |
| Bouton et formulaire | [pollution-detail.html — édition](./src/app/components/pollution-detail/pollution-detail.html#L22) | Actions Modifier/Supprimer et formulaire conditionnel. |
| Requête HTTP `PUT` | [PollutionService.update](./src/app/services/pollution.service.ts#L36) | Construit l’URL de l’élément et envoie ses champs modifiés. |
| Tests | [tests de modification](./src/app/components/pollution-detail/pollution-detail.spec.ts#L69) | Vérifient la requête `PUT` et la mise à jour de l’affichage. |

## Étape 5 — supprimer une pollution

| Sujet | Code à ouvrir | Ce qu’on y trouve |
|---|---|---|
| Suppression depuis la liste | [deletePollution de la liste](./src/app/components/pollution-list/pollution-list.ts#L241) | Confirmation, requête, retrait local après succès et affichage d’erreur. |
| Bouton de suppression dans la liste | [pollution-list.html — action Supprimer](./src/app/components/pollution-list/pollution-list.html#L227) | Transmet la pollution sélectionnée à la méthode du composant. |
| Suppression depuis le détail | [deletePollution du détail](./src/app/components/pollution-detail/pollution-detail.ts#L181) | Confirme, supprime puis navigue vers la liste. |
| Requête HTTP `DELETE` | [PollutionService.delete](./src/app/services/pollution.service.ts#L44) | Supprime une ressource via son identifiant. |
| Tests | [tests de suppression dans la liste](./src/app/components/pollution-list/pollution-list.spec.ts#L139) · [test depuis le détail](./src/app/components/pollution-detail/pollution-detail.spec.ts#L116) | Vérifient confirmation, requête et résultat attendu. |

## Étape 6 — filtrer selon plusieurs critères

| Sujet | Code à ouvrir | Ce qu’on y trouve |
|---|---|---|
| Critères et calcul des résultats | [filteredPollutions](./src/app/components/pollution-list/pollution-list.ts#L25) | Recherche, type, lieu et bornes de dates combinés avec une logique ET. |
| Mise à jour d’un critère | [méthodes de mise à jour des filtres](./src/app/components/pollution-list/pollution-list.ts#L110) | Lisent les événements HTML et modifient les signaux. |
| Réinitialisation | [resetFilters](./src/app/components/pollution-list/pollution-list.ts#L155) | Vide tous les critères. |
| Contrôles de filtre | [pollution-list.html — filtres](./src/app/components/pollution-list/pollution-list.html#L151) | Champs HTML reliés aux événements et valeurs des critères. |
| Affichage des résultats | [pollution-list.html — résultats filtrés](./src/app/components/pollution-list/pollution-list.html#L214) | Message sans résultat et boucle `@for`. |
| Test des critères combinés | [test des filtres](./src/app/components/pollution-list/pollution-list.spec.ts#L201) | Vérifie le filtrage simultané et la remise à zéro. |

## Géolocalisation — reprise du TP2

| Sujet | Code à ouvrir | Ce qu’on y trouve |
|---|---|---|
| Accès à la géolocalisation du navigateur | [GeolocationService.getCurrentPosition](./src/app/services/geolocation.service.ts#L10) | Promesse, coordonnées latitude/longitude, précision, délai et gestion d’erreurs. |
| Messages de géolocalisation | [getErrorMessage](./src/app/services/geolocation.service.ts#L35) | Transforme les codes d’erreur du navigateur en messages lisibles. |
| Remplir le formulaire de création | [locateDevice de la liste](./src/app/components/pollution-list/pollution-list.ts#L164) | Attend la position puis renseigne latitude et longitude. |
| Remplir le formulaire de modification | [locateDevice du détail](./src/app/components/pollution-detail/pollution-detail.ts#L112) | Même opération pour le formulaire d’édition. |
| Tests sans position réelle | [test géolocalisation de la liste](./src/app/components/pollution-list/pollution-list.spec.ts#L92) · [test géolocalisation du détail](./src/app/components/pollution-detail/pollution-detail.spec.ts#L153) | Simulent le service pour éviter une demande réelle au navigateur. |

## Récapitulatif — reprise du TP2

| Sujet | Code à ouvrir | Ce qu’on y trouve |
|---|---|---|
| Composant du récapitulatif | [PollutionRecap](./src/app/components/pollution-recap/pollution-recap.ts#L14) | Entrée `pollution`, sortie `close` et formatage de la date. |
| Contenu de la fenêtre | [pollution-recap.html](./src/app/components/pollution-recap/pollution-recap.html#L1) | Présente les champs, la photo éventuelle et les actions de fermeture. |
| Apparition après création | [pollution-list.html — composant récapitulatif](./src/app/components/pollution-list/pollution-list.html#L248) | Affiche le composant seulement si la création a réussi. |
| Fermeture du récapitulatif | [closeRecap](./src/app/components/pollution-list/pollution-list.ts#L226) | Efface l’état qui rend la fenêtre visible. |
| Style de la fenêtre | [pollution-recap.css](./src/app/components/pollution-recap/pollution-recap.css#L1) | Fond modal, carte et adaptation mobile. |

## Services, données et environnement

| Sujet | Code à ouvrir | Ce qu’on y trouve |
|---|---|---|
| Toutes les opérations API | [PollutionService](./src/app/services/pollution.service.ts#L8) | `list`, `getById`, `create`, `update` et `delete`. |
| Modèle d’une pollution | [Pollution](./src/app/models/pollution.ts#L15) | Champs partagés par les composants et l’API. |
| Types disponibles | [TYPES_POLLUTION](./src/app/models/pollution.ts#L1) | Catégories de pollution et type TypeScript associé. |
| URL de l’API locale | [environment.ts](./src/environments/environment.ts#L1) | Valeur de `apiBaseUrl` utilisée en développement. |
| Routage | [app.routes.ts](./src/app/app.routes.ts#L5) | Associe l’accueil et `/pollutions/:id` à leurs composants. |
| Configuration Angular | [app.config.ts](./src/app/app.config.ts#L5) | Active le client HTTP et le routeur. |

## Lire les types et paramètres courants

- `id: number | string` : identifiant attribué par l’API ; il peut être numérique
  ou textuel. `encodeURIComponent(id)` le prépare pour l’insérer dans une URL.
- `Omit<Pollution, 'id'>` : TypeScript prend la structure `Pollution` en retirant
  `id`, car le serveur gère cet identifiant à la création et l’URL le précise pour
  une modification.
- `Observable<Pollution>` : résultat asynchrone d’une requête HTTP. `subscribe`
  fournit `next` en cas de succès et `error` en cas d’échec.
- `signal(valeur)` : état réactif Angular. `set` remplace sa valeur ; `update`
  calcule une nouvelle valeur à partir de l’ancienne.
- `computed(() => ...)` : valeur dérivée, recalculée quand les signaux consultés
  dans sa fonction changent.
- `inject(Service)` : demande à Angular l’instance partagée d’un service.
- `input.required<T>()` : donnée obligatoire fournie par le composant parent.
  `output<void>()` : événement sans donnée envoyé du composant enfant vers le parent.
- Dans un template, `[propriete]="valeur"` transmet une valeur à un élément ou à
  un composant ; `(evenement)="methode()"` réagit à un événement ; `@if` et
  `@for` affichent conditionnellement des éléments ou parcourent une liste.

## Vérifications automatisées

- [Tests de la liste](./src/app/components/pollution-list/pollution-list.spec.ts#L1)
- [Tests du détail](./src/app/components/pollution-detail/pollution-detail.spec.ts#L1)

Depuis le dossier `tp3`, lancez `npm test -- --watch=false` pour exécuter les tests
et `npm run build` pour compiler l’application.
