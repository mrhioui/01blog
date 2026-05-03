import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { MainLayoutComponent } from './app/layouts/main-layout/main-layout';

(window as any).global = window;

bootstrapApplication(MainLayoutComponent, appConfig)
  .catch((err) => console.error(err));
