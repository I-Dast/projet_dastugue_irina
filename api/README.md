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

## Indice de dangerosité

L'indice est facultatif et permet à l'interface d'afficher le niveau associé.
Pour une base existante, ajouter la colonne avant de relancer l'API :

```sql
ALTER TABLE pollutions
ADD COLUMN IF NOT EXISTS "indiceDangerosite" DOUBLE PRECISION;
```

La connexion locale utilise `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD` et `DB_SSL`. Pour une base distante, `DATABASE_URL` peut remplacer
ces paramètres. Ne pas versionner le fichier `.env`.

## Administration des comptes

Configurer `ADMIN_LOGIN` et `ADMIN_PASSWORD` dans `api/.env` pour créer le
compte administrateur au démarrage. Le mot de passe doit comporter au moins
8 caractères ; il est stocké sous forme de hash. À chaque démarrage, les
identifiants configurés sont appliqués au compte administrateur. Si le login
existe déjà pour un compte ordinaire, l'API refuse de démarrer : choisissez un
login distinct. Définir aussi
`AUTH_TOKEN_SECRET` avec une valeur secrète longue et aléatoire : les jetons
d'administration expirent après 8 heures. Sans cette variable, l'API génère
une clé temporaire au démarrage et les jetons cessent alors d'être valides au
redémarrage.

Après connexion avec ce compte, l'application ouvre `/admin/users`. Cette page
permet de consulter les comptes et de supprimer les comptes ordinaires. Les
routes API de liste et de suppression sont protégées côté serveur ; le compte
administrateur ne peut pas être supprimé depuis cette interface.
