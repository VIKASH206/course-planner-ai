import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import global logout service to make it available
import './app/core/services/global-logout.service';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
