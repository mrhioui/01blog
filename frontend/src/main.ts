import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { MainLayoutComponent } from './app/layouts/main-layout/main-layout';

bootstrapApplication(MainLayoutComponent, appConfig).catch((err) => console.error(err));
