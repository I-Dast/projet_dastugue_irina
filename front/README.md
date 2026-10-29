# Front

Application Angular du formulaire utilisateur, issue de l'exercice `ex02` et
fusionnée avec les informations personnelles du formulaire d'inscription.

## Démarrage

Depuis ce dossier, lancez `npm install`, puis `npm run start:all`. L'application
Angular démarre sur `http://localhost:4200` et JSON Server sur
`http://localhost:3000`.

Les inscriptions sont envoyées à `POST /users` et enregistrées dans `db.json`.
La confirmation du mot de passe est vérifiée dans le formulaire et n'est pas
envoyée au serveur. JSON Server est utilisé uniquement pour cette démonstration :
il ne chiffre pas les mots de passe et ne doit pas servir en production.

## Vérification

- `npm run build` compile l'application.
- `npm test` lance les tests unitaires.
