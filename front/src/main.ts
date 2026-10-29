import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

<<<<<<< HEAD
bootstrapApplication(App, appConfig).catch((error: unknown) =>
  console.error(error),
);
=======
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
>>>>>>> 1e85533251dc9f86d7a4706aefe60ae74d3fb02e
