# API Pollution

## Préparer PostgreSQL avec pgAdmin

1. Installer PostgreSQL et pgAdmin, puis démarrer le serveur PostgreSQL local.
2. Dans pgAdmin, se connecter au serveur avec le mot de passe choisi pendant
   l'installation.
3. Clic droit sur **Databases** > **Create** > **Database...** et créer une base
   nommée `pollution_db`.
4. À partir de ce dossier (`api`), copier `.env.example` vers `.env`, puis
   renseigner `DB_PASSWORD` avec le mot de passe de l'utilisateur PostgreSQL.
5. Installer les dépendances et lancer l'API :

   ```sh
   npm install
   npm run dev
   ```

Au démarrage, l'API se connecte à `pollution_db`, crée la table `pollution` si
elle n'existe pas encore et insère un jeu de données si la table est vide. Dans
pgAdmin, actualiser **Schemas > public > Tables** pour voir la table.

## Tester les routes GET

- `http://localhost:3000/api/pollutions` : liste des mesures
- `http://localhost:3000/api/pollutions/1` : mesure d'identifiant 1
- `http://localhost:3000/health` : état de l'API

La connexion locale utilise `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD` et `DB_SSL`. Pour une base distante, `DATABASE_URL` peut remplacer
ces paramètres. Ne pas versionner le fichier `.env`.
