# Frontend

## Lancer l'application

Depuis ce dossier, installez les dépendances puis démarrez Angular :

```sh
npm install
npm run dev
```

L'application est disponible sur <http://localhost:4200>. Le mode de
développement appelle l'API Node.js sur <http://localhost:3000>. Démarrez aussi
PostgreSQL et l'API depuis `api/` avec `npm run dev`. Les déclarations sont
enregistrées dans la base PostgreSQL. JSON Server reste disponible en alternative
avec `npm run api` (port 53903), mais il n'est pas utilisé par défaut.

La page d'accueil contient le formulaire d'inscription. Après la création du
compte, l'application affiche la liste des pollutions. Le bouton **Ajouter une
pollution** ouvre un formulaire séparé ; les liens de détail et les boutons de
suppression restent disponibles dans la liste.

## Build et tests

```sh
npm run build
npm test
```

## Déploiement Render

Le Blueprint du dépôt construit le site depuis ce dossier et publie
`dist/pollution/browser`. La configuration de production appelle l'API
Node/PostgreSQL déployée sur Render.

Pour naviguer dans le code par fonctionnalité, consultez le
[guide de navigation](./GUIDE-CODE.md).
