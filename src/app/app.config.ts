import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';

/**
 * Aura with a few darker shades so text meets WCAG AA contrast (4.5:1): Aura's defaults put white
 * text on emerald-500 (2.5:1) and red-500 (3.8:1), and blue-500 on the dark info toast (4:1).
 */
const AccessibleAura = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}',
        },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            danger: {
              background: '{red.600}',
              hoverBackground: '{red.700}',
              activeBackground: '{red.800}',
              borderColor: '{red.600}',
              hoverBorderColor: '{red.700}',
              activeBorderColor: '{red.800}',
            },
          },
        },
      },
    },
    toast: {
      colorScheme: {
        dark: {
          info: { color: '{blue.400}' },
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // PrimeNG FileUpload injects HttpClient even though images are read locally, never uploaded.
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: AccessibleAura,
        // Dark mode is driven by the class toggled on <html> by ThemeToggle.
        options: { darkModeSelector: '.app-dark' },
      },
    }),
  ],
};
