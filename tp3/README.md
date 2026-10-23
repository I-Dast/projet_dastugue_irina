# Tp3

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Development server

To start the Angular application and the mock API together, run from this
directory:

```bash
npm run dev
```

The Angular application is available at `http://localhost:4200/` and the API at
`http://localhost:53903`. Stop both servers with `Ctrl+C`.

## Mock API

The project uses JSON Server as a local REST API. Start it from this directory in a
second terminal:

```bash
npm run api
```

The API is available at `http://localhost:53903`. The routes `GET /tp3/pollution`,
`POST /tp3/pollution`, `GET /tp3/pollution/:id`, `PUT /tp3/pollution/:id` and
`DELETE /tp3/pollution/:id` are rewritten to the `pollutions` collection stored
in `db.json`; submitted entries remain in that file. From the list, use
**Voir le détail** to open a pollution at
`/pollutions/:id`, then use **Modifier** to update it or **Supprimer** to remove
it after confirming the action. The list also provides a **Supprimer** button.
Filter the list by keyword, pollution type, location, or observation date range;
criteria can be combined and reset at any time.
The declaration and edit forms can fill in latitude and longitude using the
browser's **Utiliser ma position** button; the browser must grant location
permission and the application must be served over HTTPS or localhost. The
interface uses the TP02 green-to-lime background and slate controls.
To start either server separately, use `npm start` for Angular and `npm run api`
for the API.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
