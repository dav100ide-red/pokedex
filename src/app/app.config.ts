import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { DARK_MODE_CLASS } from './theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // PrimeNG FileUpload injects HttpClient even when uploads are handled locally.
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: `.${DARK_MODE_CLASS}` },
      },
      // Keeps dropdown and calendar overlays from being clipped inside the dialog.
      overlayAppendTo: 'body',
    }),
  ]
};
