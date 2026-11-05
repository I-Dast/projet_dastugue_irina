# Guide de navigation dans le code

Ce guide présente le parcours actuel de l’application et indique où lire chaque
fonctionnalité. Les composants Angular gèrent l’écran et les interactions, les
services centralisent les appels HTTP, et l’API Node.js valide les données avant
de les enregistrer dans PostgreSQL.

## Parcours de navigation

| Écran | URL | Rôle |
|---|---|---|
| Inscription | `/` | Crée un compte puis ouvre la liste après confirmation de l’API. |
| Liste des pollutions | `/pollutions` | Charge, filtre et affiche les déclarations ; permet le détail et la suppression. |
| Nouvelle pollution | `/pollutions/new` | Présente le formulaire de création et le récapitulatif après succès. |
| Détail | `/pollutions/:id` | Affiche une déclaration et permet de la modifier ou de la supprimer. |

Le routage est défini dans [app.routes.ts](./src/app/app.routes.ts). La route
`/pollutions/new` est déclarée avant la route paramétrée `/pollutions/:id`, afin
que `new` soit traité comme la page de création.

## Inscription et données utilisateur

| Sujet | Code à ouvrir | Explication |
|---|---|---|
| Formulaire et validation | [signup.ts](./src/app/components/signup/signup.ts) | Définit les champs utiles au compte, leurs validateurs et la confirmation du mot de passe. |
| Formulaire affiché | [signup.html](./src/app/components/signup/signup.html) | Présente les champs et les erreurs de validation accessibles. |
| Requête d’inscription | [UserService](./src/app/services/user.service.ts) | Envoie les seules données conservées par l’API. |
| Contrôleur utilisateur | [user.controllers.ts](../api/src/controllers/user.controllers.ts) | Valide une liste blanche de champs, crée le compte et construit les réponses publiques. |
| Modèle PostgreSQL | [users.model.ts](../api/src/models/users.model.ts) | Décrit les colonnes persistées dans la table `users`. |
| Routes utilisateur | [user.routes.ts](../api/src/routes/user.routes.ts) | Expose la création, la liste et la suppression sous `/api/users`. |
| Tests | [signup.spec.ts](./src/app/components/signup/signup.spec.ts) · [user.service.spec.ts](./src/app/services/user.service.spec.ts) · [controllers.test.cjs](../api/tests/controllers.test.cjs) | Vérifient les champs envoyés, l’absence des données supprimées et les réponses API. |

Le compte conserve uniquement l’identifiant, le nom, le prénom, l’e-mail, le
téléphone et le hash du mot de passe. **L’adresse postale et la date de
naissance ne sont plus demandées par le front, acceptées pour stockage par
l’API, ni renvoyées dans les réponses utilisateur.** La confirmation du mot de
passe n’est utilisée que pour valider le formulaire et n’est pas envoyée.

Au démarrage, [index.ts](../api/src/index.ts) exécute une migration PostgreSQL
qui supprime les anciennes colonnes `adresse` et `dateNaissance` de `users`.
Elle est répétable sans erreur, mais supprime définitivement les valeurs
existantes de ces colonnes. Les autres données des comptes ne sont pas
supprimées.

## Déclarer une pollution et voir le récapitulatif

| Sujet | Code à ouvrir | Explication |
|---|---|---|
| Formulaire et validation | [pollution-create.ts](./src/app/components/pollution-create/pollution-create.ts) | Valide les champs, demande la géolocalisation et envoie la déclaration. |
| Formulaire affiché | [pollution-create.html](./src/app/components/pollution-create/pollution-create.html) | Relie les contrôles du formulaire aux actions et erreurs du composant. |
| Création HTTP | [PollutionService.create](./src/app/services/pollution.service.ts) | Envoie un `POST` à l’API et transforme les erreurs en messages affichables. |
| Fenêtre de récapitulatif | [PollutionRecap](./src/app/components/pollution-recap/pollution-recap.ts) · [pollution-recap.html](./src/app/components/pollution-recap/pollution-recap.html) | Présente les informations confirmées par l’API et permet de fermer la fenêtre. |
| Rendu après succès | [pollution-create.html](./src/app/components/pollution-create/pollution-create.html) | Affiche le récapitulatif seulement quand la réponse de création est reçue. |
| Test du parcours | [pollution-create.spec.ts](./src/app/components/pollution-create/pollution-create.spec.ts) | Vérifie la requête `POST` et l’apparition du récapitulatif après sa réponse. |

Le récapitulatif ne s’ouvre qu’après une création confirmée. Si l’API renvoie
une erreur, le formulaire reste affiché avec un message explicite. L’état du
récapitulatif est un signal Angular afin que la réponse asynchrone mette
immédiatement à jour le template.

## Liste, filtres et détail

| Sujet | Code à ouvrir | Explication |
|---|---|---|
| Chargement et filtres | [pollution-list.ts](./src/app/components/pollution-list/pollution-list.ts) | Charge les déclarations et combine recherche, type, lieu et dates. |
| Liste et actions | [pollution-list.html](./src/app/components/pollution-list/pollution-list.html) | Affiche les résultats et les liens vers l’ajout, le détail et la suppression. |
| Détail et modification | [pollution-detail.ts](./src/app/components/pollution-detail/pollution-detail.ts) · [pollution-detail.html](./src/app/components/pollution-detail/pollution-detail.html) | Charge une pollution, permet de modifier ses champs et de la supprimer. |
| Modèle partagé | [Pollution](./src/app/models/pollution.ts) | Décrit les propriétés échangées entre les formulaires, l’API et la base. |
| Routes API | [pollution.routes.ts](../api/src/routes/pollution.routes.ts) | Déclare les opérations `GET`, `POST`, `PUT` et `DELETE`. |
| Validation et contrôleur API | [pollution.controllers.ts](../api/src/controllers/pollution.controllers.ts) | Vérifie les données et identifiants avant les opérations Sequelize. |
| Modèle Sequelize | [pollutions.model.ts](../api/src/models/pollutions.model.ts) | Décrit les colonnes de la table `pollutions`. |

## Géolocalisation

| Sujet | Code à ouvrir | Explication |
|---|---|---|
| API de géolocalisation du navigateur | [GeolocationService](./src/app/services/geolocation.service.ts) | Récupère les coordonnées et traduit les erreurs du navigateur. |
| Utilisation à la création | [PollutionCreate.locateDevice](./src/app/components/pollution-create/pollution-create.ts) | Remplit les champs latitude et longitude du formulaire. |
| Utilisation dans le détail | [PollutionDetail.locateDevice](./src/app/components/pollution-detail/pollution-detail.ts) | Remplit les coordonnées pendant la modification. |

## Configuration et lancement local

| Sujet | Code à ouvrir | Explication |
|---|---|---|
| URL de l’API et mode mock | [environment.ts](./src/environments/environment.ts) | Le développement courant utilise l’API Node à `http://localhost:3000` (`useMock: false`). |
| Sélection de l’intercepteur | [app.config.ts](./src/app/app.config.ts) | Active le backend simulé uniquement si `useMock` est vrai. |
| URL des requêtes pollution | [PollutionService](./src/app/services/pollution.service.ts) | Choisit l’endpoint selon la configuration de l’environnement. |
| Configuration PostgreSQL | [config API](../api/src/config.ts) | Lit les paramètres de connexion fournis par `api/.env`. |

Depuis la racine du dépôt, `npm run dev` démarre le front et l’API dans le même
terminal. PostgreSQL doit être démarré et accessible à l’API ; le front est
disponible sur <http://localhost:4200>.

## Tests et build

Depuis la racine du dépôt :

```sh
npm --prefix front test -- --watch=false
npm --prefix front run build -- --configuration production
npm --prefix api test
```

Les tests du front couvrent les composants et services Angular. Les tests de
l’API compilent TypeScript puis utilisent des méthodes Sequelize simulées : ils
ne nécessitent pas de connexion PostgreSQL réelle.
