# Projet de déclaration des pollutions

## Lancer l'application localement

Depuis la racine du dépôt :

```sh
npm run dev
```

Cette commande démarre en même temps l'API Node.js et le front Angular. Le
front est accessible sur <http://localhost:4200> et l'API sur
<http://localhost:3000>. L'API doit pouvoir se connecter à PostgreSQL ; vérifiez
la configuration locale dans [`api/.env`](./api/.env) avant de démarrer.

Les journaux des deux services apparaissent dans le même terminal. Arrêtez-les
ensemble avec `Ctrl+C`. L'API est documentée dans [`api/README.md`](./api/README.md).
