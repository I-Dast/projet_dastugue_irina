# Guide des comptes administrateur et de la déconnexion

Ce guide décrit l’animation « Bye bye ! », le bouton de déconnexion et le
parcours d’administration des comptes. Il indique aussi où retrouver les
fichiers ajoutés ou modifiés pour ces fonctionnalités.

## Animation de la main

L’animation est gérée par le composant racine Angular, afin que le bouton et
son effet soient disponibles sur toutes les pages quand une session est
ouverte.

1. Dans [`app.html`](./src/app/app.html), le bouton appelle les méthodes du
   composant aux événements `pointerenter`, `pointermove` et `pointerleave`.
   L’élément « Bye bye ! » est affiché seulement quand le signal
   `logoutWaveVisible` est vrai.
2. Dans [`app.ts`](./src/app/app.ts), `showLogoutWave` vérifie que le pointeur
   est une souris. `moveLogoutWave` suit son déplacement et
   `hideLogoutWave` masque l’animation quand le pointeur quitte le bouton.
   `updateLogoutWavePosition` place la main 48 pixels à gauche et 16 pixels
   sous le pointeur.
3. Dans [`app.css`](./src/app/app.css), la règle
   `@media (hover: hover) and (pointer: fine)` réserve l’effet aux appareils
   avec un pointeur précis et un survol. L’emoji de main est éclairci et
   désaturé pour paraître blanc ; le message est en Calibri Light. L’animation
   CSS `logout-wave` fait osciller la main.
4. La règle `prefers-reduced-motion` désactive l’oscillation lorsque le
   système demande de réduire les animations.
5. `styleUrl: './app.css'` dans le décorateur de [`app.ts`](./src/app/app.ts)
   charge les styles du composant racine.

Le clic sur le bouton appelle `logout()` dans `app.ts`. Cette méthode efface la
session par `UserService.endSession()` puis navigue vers `/login`.

### Fichiers de l’animation et de la déconnexion

| Fichier | Rôle |
|---|---|
| [`src/app/app.html`](./src/app/app.html) | Bouton, icône de sortie, événements du pointeur et message animé. |
| [`src/app/app.ts`](./src/app/app.ts) | Détection souris/tactile, positionnement et affichage de la main, action de déconnexion. |
| [`src/app/app.css`](./src/app/app.css) | Position et couleur du bouton, visibilité ordinateur, style du message et animation. |
| [`src/app/services/user.service.ts`](./src/app/services/user.service.ts) | État de session et méthodes de connexion/déconnexion. |
| [`src/app/components/login/login.ts`](./src/app/components/login/login.ts) | Démarre la session après une authentification réussie. |
| [`src/app/components/signup/signup.ts`](./src/app/components/signup/signup.ts) | Démarre la session après une inscription réussie. |
| [`src/app/app.spec.ts`](./src/app/app.spec.ts) | Vérifie l’affichage du bouton et la distinction souris/tactile pour la main. |
| [`src/app/services/user.service.spec.ts`](./src/app/services/user.service.spec.ts) | Vérifie l’état de session et les requêtes administrateur. |

La main est un élément décoratif (`aria-hidden`) : le bouton garde le nom
accessible « Se déconnecter ».

## Session et déconnexion

Après connexion, `UserService.startSession()` enregistre un marqueur de
session dans `sessionStorage`. Pour un administrateur, il conserve également
le jeton API. Le signal `isAuthenticated` pilote l’affichage du bouton.
Une inscription réussie démarre aussi une session, car le formulaire envoie
directement le nouvel utilisateur vers `/pollutions`.

`UserService.endSession()` supprime le marqueur et le jeton, puis met à jour le
signal. Le bouton partagé dans `app.html` appelle cette méthode pour les deux
rôles. Le jeton administrateur reste distinct de la simple session d’un
utilisateur.

## Administration des comptes

### Initialisation et protection de l’API

- [`../api/src/config.ts`](../api/src/config.ts) lit `ADMIN_LOGIN`,
  `ADMIN_PASSWORD` et `AUTH_TOKEN_SECRET`.
- [`../api/src/index.ts`](../api/src/index.ts) ajoute la colonne
  `isAdmin` si elle n’existe pas et initialise le compte administrateur au
  démarrage de l’API.
- [`../api/src/models/users.model.ts`](../api/src/models/users.model.ts)
  décrit la propriété `isAdmin` dans la table `users`.
- [`../api/src/controllers/user.controllers.ts`](../api/src/controllers/user.controllers.ts)
  crée les comptes ordinaires, initialise le compte configuré, authentifie les
  comptes et empêche la suppression d’un administrateur.
- [`../api/src/controllers/admin-auth.ts`](../api/src/controllers/admin-auth.ts)
  crée et vérifie les jetons d’administration signés, valables 8 heures.
- [`../api/src/middleware/require-admin.ts`](../api/src/middleware/require-admin.ts)
  valide le jeton et vérifie le rôle en base avant chaque opération protégée.
- [`../api/src/routes/user.routes.ts`](../api/src/routes/user.routes.ts)
  protège `GET /api/users` et `DELETE /api/users/:id`. L’inscription
  `POST /api/users` reste publique.

Les valeurs de configuration sont dans le fichier local `api/.env`, qui est
ignoré par Git. Ne pas copier les mots de passe ni la clé de signature dans ce
guide ou dans un fichier versionné.

### Écran administrateur

- [`src/app/app.routes.ts`](./src/app/app.routes.ts) déclare `/admin/users`.
- [`src/app/guards/auth.guard.ts`](./src/app/guards/auth.guard.ts) protège les
  pages de pollution et redirige vers la connexion sans session.
- [`src/app/guards/admin.guard.ts`](./src/app/guards/admin.guard.ts) redirige
  vers la connexion si aucun jeton administrateur n’est conservé.
- [`src/app/components/login/login.ts`](./src/app/components/login/login.ts)
  envoie un administrateur vers `/admin/users` et un utilisateur ordinaire vers
  `/pollutions`.
- [`src/app/components/admin-users/admin-users.ts`](./src/app/components/admin-users/admin-users.ts)
  charge les comptes, demande confirmation avant suppression et affiche les
  erreurs.
- [`src/app/components/admin-users/admin-users.html`](./src/app/components/admin-users/admin-users.html)
  présente le tableau des utilisateurs.
- [`src/app/components/admin-users/admin-users.css`](./src/app/components/admin-users/admin-users.css)
  met en forme la page et le tableau.
- [`src/app/services/user.service.ts`](./src/app/services/user.service.ts)
  ajoute le jeton aux requêtes de liste et de suppression.

## Inventaire des fichiers ajoutés ou modifiés

### Nouveaux fichiers

- `front/GUIDE-COMPTES-ADMIN-DECONNEXION.md` — ce guide.
- `front/src/app/guards/admin.guard.ts` — garde de la route administrateur.
- `front/src/app/guards/auth.guard.ts` — garde des pages de pollution.
- `front/src/app/guards/auth.guard.spec.ts` — tests du garde de session.
- `front/src/app/components/admin-users/admin-users.ts` — logique de la page.
- `front/src/app/components/admin-users/admin-users.html` — tableau et actions.
- `front/src/app/components/admin-users/admin-users.css` — styles de la page.
- `api/src/controllers/admin-auth.ts` — création et validation des jetons.
- `api/src/middleware/require-admin.ts` — contrôle d’accès aux routes API.

### Fichiers existants modifiés

- Front : `src/app/app.ts`, `app.html`, `app.css`, `app.routes.ts`,
  `app.spec.ts`, `components/login/login.ts`,
  `components/login/login.spec.ts`, `components/signup/signup.ts`,
  `components/signup/signup.spec.ts`, `services/user.service.ts` et
  `services/user.service.spec.ts`.
- API : `src/config.ts`, `src/index.ts`, `src/models/users.model.ts`,
  `src/controllers/user.controllers.ts`, `src/routes/user.routes.ts` et
  `tests/controllers.test.cjs`.
- Documentation : `api/README.md` et `README.md` à la racine du dépôt.

[`GUIDE-CODE.md`](./GUIDE-CODE.md) est un guide préexistant sur le reste de
l’application ; il n’a pas été modifié pour ces fonctionnalités.

## Vérification

Depuis la racine du dépôt :

```sh
npm --prefix front test -- --watch=false
npm --prefix front run build
npm --prefix api test
```
