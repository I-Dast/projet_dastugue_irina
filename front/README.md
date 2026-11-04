# Frontend

## Lancer l'application

Depuis ce dossier, installez les dépendances puis démarrez Angular :

```sh
npm install
npm run dev
```

L'application est disponible sur <http://localhost:4200>. Le mode de
développement utilise un backend simulé qui conserve les déclarations dans le
stockage local du navigateur. JSON Server est disponible en alternative avec
`npm run api` (port 53903).

## Build et tests

```sh
npm run build
npm test
```

## Déploiement Render

Le Blueprint du dépôt construit le site depuis ce dossier et publie
`dist/pollution/browser`. La configuration de production utilise le backend
simulé local au navigateur ; l'API Node/PostgreSQL déclarée dans le Blueprint
reste un service distinct.

Pour naviguer dans le code par fonctionnalité, consultez le
[guide de navigation](./GUIDE-CODE.md).
