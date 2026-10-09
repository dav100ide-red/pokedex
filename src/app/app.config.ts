import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { DARK_MODE_CLASS, ThemeService } from './theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: `.${DARK_MODE_CLASS}` },
      },
    }),
    // Apply the saved light/dark mode at startup, before the lazy-loaded page renders.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
