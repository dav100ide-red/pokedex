import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { PokedexPreset } from './theme/pokedex-preset';
import { DARK_MODE_CLASS } from './theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // PrimeNG's FileUpload injects HttpClient even when the upload is handled locally.
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: PokedexPreset,
        options: { darkModeSelector: `.${DARK_MODE_CLASS}` },
      },
    }),
  ],
};
