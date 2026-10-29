# Angular : Observables et injection de dépendances

Ce cours présente deux notions importantes d’Angular : les **Observables** de
RxJS, utilisés notamment pour les traitements asynchrones, et l’**injection de
dépendances**, qui permet de fournir à un composant les services dont il a
besoin.

Les exemples font le lien avec l’application du TP3, qui charge et modifie des
déclarations de pollution.

## 1. Les Observables

### 1.1. À quoi sert un Observable ?

Un `Observable<T>` représente une suite de valeurs asynchrones de type `T`.
Cette suite peut produire :

- zéro, une ou plusieurs valeurs (`next`) ;
- une erreur (`error`) ;
- puis, éventuellement, une fin normale (`complete`).

On peut voir un Observable comme une source qui annonce : « Je pourrai fournir
une ou plusieurs valeurs plus tard. » Il est particulièrement adapté aux
événements et aux opérations qui prennent du temps.

Exemples :

- une réponse d’API HTTP ;
- des clics ou des frappes au clavier ;
- des mises à jour régulières ;
- des changements de route ;
- des données reçues d’un flux en continu.

Le type générique indique la forme des valeurs émises. Par exemple,
`Observable<Pollution[]>` représente un Observable qui fournit une liste de
pollutions.

### 1.2. Créer et consommer un Observable

Dans Angular, `HttpClient` renvoie des Observables :

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/pollutions';

  list(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>(this.endpoint);
  }
}
```

Le service décrit l’opération et renvoie l’Observable. Le composant s’abonne
pour recevoir le résultat :

```ts
this.pollutionService.list().subscribe({
  next: (pollutions) => {
    this.pollutions.set(pollutions);
  },
  error: (error: unknown) => {
    this.errorMessage.set('Le chargement a échoué.');
  },
});
```

Dans cet exemple :

- `next` traite la réponse réussie ;
- `error` traite l’échec ;
- `complete`, si nécessaire, traite la fin de la séquence.

Les blocs `next`, `error` et `complete` sont indépendants : une erreur termine
la séquence et ne déclenche pas `complete`.

### 1.3. L’abonnement déclenche le traitement

Un Observable renvoyé par `HttpClient` est généralement **paresseux** : la
requête ne part pas au moment où l’on appelle `get()`, mais lorsque l’on
s’abonne.

```ts
const request$ = this.http.get<Pollution[]>('/api/pollutions');
// À ce stade, la requête HTTP n'a généralement pas encore été envoyée.

request$.subscribe({
  next: (pollutions) => console.log(pollutions),
});
// L'abonnement démarre la requête.
```

Par convention, le suffixe `$` dans un nom comme `request$` indique souvent
qu’il s’agit d’un Observable. Ce n’est pas une obligation du langage, mais
c’est une convention utile.

Avec un Observable HTTP froid, s’abonner deux fois peut lancer deux requêtes
distinctes :

```ts
const request$ = this.http.get<Pollution[]>('/api/pollutions');

request$.subscribe(); // Première requête
request$.subscribe(); // Deuxième requête
```

Il faut donc éviter de multiplier les abonnements sans raison. Pour partager
une source entre plusieurs consommateurs, RxJS fournit notamment des
opérateurs de partage comme `shareReplay`, à employer lorsqu’on a réellement
besoin de ce comportement.

### 1.4. Transformer et combiner des flux avec `pipe`

Les opérateurs RxJS permettent de transformer ou de coordonner les valeurs sans
modifier la source. On les chaîne avec `pipe()` :

```ts
import { map } from 'rxjs';

this.pollutionService.list()
  .pipe(
    map((pollutions) => pollutions.length),
  )
  .subscribe({
    next: (nombre) => console.log(`Nombre de déclarations : ${nombre}`),
    error: (error: unknown) => console.error(error),
  });
```

Quelques opérateurs courants :

| Opérateur | Utilité | Exemple d’utilisation |
|---|---|---|
| `map` | Transformer chaque valeur | Convertir une réponse en nombre de résultats |
| `filter` | Ne garder que certaines valeurs | Ignorer les événements qui ne répondent pas à un critère |
| `tap` | Effectuer un effet secondaire sans transformer la valeur | Ajouter une trace de diagnostic |
| `catchError` | Intercepter et remplacer ou relancer une erreur | Présenter une erreur HTTP compréhensible |
| `switchMap` | Remplacer le flux précédent par un nouveau flux | Lancer une recherche à chaque saisie et ne garder que la plus récente |
| `debounceTime` | Attendre une pause entre des événements rapprochés | Éviter une requête à chaque frappe |
| `takeUntil` | Arrêter un flux lorsqu’un autre signal survient | Nettoyer un abonnement lié à un composant |

Exemple de recherche réactive :

```ts
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => this.searchService.search(term)),
  )
  .subscribe({
    next: (results) => this.results.set(results),
    error: (error: unknown) => this.errorMessage.set('La recherche a échoué.'),
  });
```

`switchMap` est utile ici car une nouvelle saisie rend la recherche précédente
inutile. Il se désabonne du flux précédent et suit le nouveau.

### 1.5. Gérer les erreurs

On peut traiter l’erreur au point d’abonnement, dans un opérateur, ou combiner
les deux approches selon le besoin. Dans le service du TP3, `catchError`
convertit les erreurs HTTP en erreurs métier plus faciles à présenter :

```ts
return request.pipe(
  catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse) {
      return throwError(
        () => new PollutionServiceError(
          `Impossible de charger les pollutions (erreur HTTP ${error.status}).`,
          error.status,
        ),
      );
    }

    return throwError(
      () => new PollutionServiceError('Une erreur inattendue est survenue.'),
    );
  }),
);
```

`catchError` doit renvoyer un nouvel Observable : ici `throwError` transmet une
erreur typée à l’abonné. Côté composant, l’erreur peut ensuite être transformée
en message visible :

```ts
error: (error: unknown) => {
  this.listErrorMessage.set(
    this.pollutionService.getErrorMessage(error),
  );
},
```

### 1.6. Désabonnement et durée de vie

Un abonnement à un flux qui continue longtemps peut rester actif après la
destruction du composant. Il faut alors l’arrêter pour éviter des traitements
inutiles ou des fuites mémoire.

Les requêtes HTTP Angular émettent normalement une réponse puis se terminent :
leur abonnement n’a généralement pas besoin d’être arrêté manuellement. Les
flux d’événements ou les flux continus, eux, demandent une attention
particulière.

Avec Angular récent, `takeUntilDestroyed` permet de lier le désabonnement à la
durée de vie du composant :

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

this.form.controls.search.valueChanges
  .pipe(takeUntilDestroyed())
  .subscribe((value) => {
    console.log(value);
  });
```

Cette forme s’utilise dans un contexte d’injection Angular, par exemple dans
le constructeur ou une méthode appelée depuis ce contexte. En dehors de ce
contexte, on peut fournir explicitement un `DestroyRef`.

### 1.7. Observable ou Promise ?

Une `Promise<T>` représente un résultat asynchrone unique : elle réussit une
fois ou échoue une fois. Un Observable peut produire plusieurs valeurs et offre
des opérateurs de composition ainsi qu’un désabonnement.

| Besoin | Choix souvent adapté |
|---|---|
| Réponse unique d’une API Angular | Observable de `HttpClient` |
| Plusieurs événements dans le temps | Observable |
| Opération asynchrone ponctuelle simple | Promise |
| Annuler ou remplacer une opération en cours | Observable avec opérateurs adaptés |

Dans le TP3, les appels HTTP de `PollutionService` sont des Observables. La
géolocalisation de `GeolocationService.getCurrentPosition()` est une Promise,
car elle attend une position ponctuelle. Le composant l’utilise avec `await`
et `try/catch` :

```ts
try {
  const position = await this.geolocationService.getCurrentPosition();
  this.editForm.patchValue(position);
} catch (error: unknown) {
  this.locationErrorMessage.set(
    error instanceof Error ? error.message : 'Erreur de géolocalisation.',
  );
}
```

Les deux outils répondent donc à des besoins différents ; il n’est pas
nécessaire de transformer systématiquement une Promise en Observable ou
l’inverse.

## 2. L’injection de dépendances

### 2.1. Le principe

Un composant a souvent besoin d’autres objets pour fonctionner : un service
HTTP, le routeur, un constructeur de formulaire, etc. Sans injection, le
composant devrait créer lui-même ces objets et connaître leurs détails de
construction.

L’**injection de dépendances** (DI, pour *Dependency Injection*) consiste à
demander ces dépendances à Angular. Le framework les construit ou les récupère
auprès de son registre de fournisseurs, puis les fournit à l’objet qui en a
besoin.

Le composant exprime ainsi ce dont il dépend, sans gérer lui-même la création
de chaque service.

### 2.2. Déclarer un service injectable

Dans le TP3, un service est déclaré ainsi :

```ts
@Injectable({ providedIn: 'root' })
export class PollutionService {
  // ...
}
```

`@Injectable` indique qu’Angular peut gérer ce service. `providedIn: 'root'`
l’enregistre dans l’injecteur racine de l’application. En pratique, les
composants qui le demandent partagent la même instance au niveau de cet
injecteur.

Le service est ensuite injecté dans un composant avec `inject()` :

```ts
import { Component, inject } from '@angular/core';
import { PollutionService } from './services/pollution.service';

@Component({
  selector: 'app-pollution-list',
  template: '',
})
export class PollutionList {
  private readonly pollutionService = inject(PollutionService);
}
```

Dans les composants standalone récents, la fonction `inject()` est une forme
courante. Angular propose aussi l’injection par constructeur :

```ts
export class PollutionList {
  constructor(private readonly pollutionService: PollutionService) {}
}
```

Les deux formes demandent la même dépendance à Angular. Il est préférable de
suivre de façon cohérente le style déjà utilisé dans le projet.

### 2.3. Exemple complet : composant, service et HTTP

Le composant ne devrait pas construire lui-même les URLs et les requêtes. Il
délègue cette responsabilité à un service :

```ts
@Injectable({ providedIn: 'root' })
export class PollutionService {
  private readonly http = inject(HttpClient);

  list(): Observable<Pollution[]> {
    return this.http.get<Pollution[]>('/api/pollutions');
  }
}
```

Puis le composant injecte le service :

```ts
export class PollutionList implements OnInit {
  private readonly pollutionService = inject(PollutionService);

  ngOnInit(): void {
    this.pollutionService.list().subscribe({
      next: (pollutions) => this.pollutions.set(pollutions),
      error: () => this.listErrorMessage.set('Le chargement a échoué.'),
    });
  }
}
```

Cette séparation clarifie les responsabilités :

- le service gère l’accès aux données et les opérations HTTP ;
- le composant gère l’état et l’affichage de l’interface ;
- Angular fournit les dépendances nécessaires.

Dans le projet, `PollutionService` injecte `HttpClient`, tandis que les
composants de liste et de détail injectent `PollutionService`. Ils injectent
aussi `GeolocationService` lorsqu’ils ont besoin de récupérer la position de
l’appareil.

### 2.4. Fournisseurs et configuration

Un injecteur Angular associe un **token** à une valeur ou à une manière de la
construire. Une classe de service peut servir directement de token :

```ts
inject(PollutionService);
```

Mais certaines dépendances ne sont pas des classes, comme une configuration ou
une URL. On peut alors utiliser `InjectionToken` :

```ts
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');
```

Le fournisseur associe une valeur au token :

```ts
providers: [
  { provide: API_URL, useValue: 'https://exemple.test/api' },
]
```

Un service peut ensuite la demander :

```ts
private readonly apiUrl = inject(API_URL);
```

Pour une valeur d’environnement dans une application Angular, le mécanisme de
configuration du projet peut aussi suffire. Dans le TP3, l’URL de base est lue
depuis `environment.apiBaseUrl` plutôt que fournie par un `InjectionToken`.

### 2.5. Fournir un service à différentes portées

La portée du fournisseur détermine quelles parties de l’application partagent
une instance :

- **`providedIn: 'root'`** : instance partagée à l’échelle de l’application,
  choix courant pour les services sans état local à un composant ;
- **`providers` dans un composant** : instance rattachée à ce composant et à
  son sous-arbre ; une nouvelle instance peut être créée pour une autre
  instance du composant ;
- **fournisseur dans la configuration de l’application** : utile pour
  configurer des fonctionnalités globales, comme `HttpClient` ou le routeur.

Le TP3 configure `HttpClient` et ses intercepteurs dans `app.config.ts` avec
`provideHttpClient(...)`. Les services `PollutionService` et
`GeolocationService` utilisent `providedIn: 'root'`.

Il faut choisir la portée selon le besoin : fournir un service au niveau d’un
composant alors qu’il devrait être partagé peut créer plusieurs instances et
des états différents.

### 2.6. Pourquoi utiliser l’injection ?

**Réutilisation.** Plusieurs composants peuvent s’appuyer sur le même service,
sans dupliquer la logique d’accès aux données.

**Séparation des responsabilités.** Un composant n’a pas à savoir comment
construire un client HTTP ou comment communiquer avec le navigateur.

**Remplacement et test.** On peut substituer une dépendance par une fausse
implémentation ou un espion dans un test, afin de tester le composant sans
appeler réellement l’API ou la géolocalisation.

**Configuration centralisée.** Les fournisseurs Angular réunissent les
dépendances globales et leurs options en un même endroit.

### 2.7. Injection dans les tests

Un test peut fournir un faux service au lieu du service réel. Par exemple,
`PollutionService` peut être remplacé par un objet qui renvoie des données
préparées :

```ts
const pollutionServiceStub = {
  list: () => of<Pollution[]>([]),
};
```

Ce faux service peut être enregistré comme fournisseur dans le test. Le
composant reste testé avec la même dépendance (`PollutionService`), mais le
test contrôle le résultat et n’effectue pas de véritable requête réseau.

Pour tester des appels HTTP tout en conservant le vrai service, Angular fournit
aussi des outils de test HTTP, par exemple `provideHttpClientTesting()` et
`HttpTestingController`.

## 3. À retenir

- Un Observable décrit une source asynchrone ; l’abonnement permet d’en
  consommer les valeurs.
- `HttpClient` renvoie des Observables. Les cas de succès et d’erreur se
  traitent notamment avec `next` et `error`.
- `pipe()` compose des opérateurs RxJS pour transformer, filtrer ou coordonner
  un flux.
- Les flux continus doivent être nettoyés à la fin de vie du composant ; les
  requêtes HTTP usuelles se terminent après leur réponse.
- Une Promise convient à un résultat asynchrone ponctuel ; un Observable gère
  aussi les flux de plusieurs valeurs et les compositions réactives.
- L’injection de dépendances permet à Angular de fournir les services et
  ressources demandés par un composant ou un autre service.
- `providedIn: 'root'` rend un service injectable à l’échelle de l’application ;
  les fournisseurs locaux permettent de choisir une portée plus limitée.
- Dans le TP3, `PollutionService` encapsule les appels HTTP, et
  `GeolocationService` encapsule l’API de géolocalisation du navigateur.

## 4. Repères dans le projet

- `tp3/src/app/services/pollution.service.ts` : appels HTTP et gestion des
  erreurs sous forme d’Observables.
- `tp3/src/app/services/geolocation.service.ts` : service injectable qui
  retourne une Promise de géolocalisation.
- `tp3/src/app/components/pollution-list/pollution-list.ts` : injection des
  services et abonnement au chargement de la liste.
- `tp3/src/app/components/pollution-detail/pollution-detail.ts` : injection,
  appels de lecture, modification, suppression et géolocalisation.
- `tp3/src/app/app.config.ts` : configuration des fournisseurs HTTP, des
  intercepteurs et du routeur.
