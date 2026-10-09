import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

/** Class set on <html> in dark mode, used as PrimeNG's `darkModeSelector` (see app.config.ts). */
export const DARK_MODE_CLASS = 'app-dark';

const STORAGE_KEY = 'pokedex-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  private readonly darkModeState = signal(this.initialDarkMode());
  readonly darkMode = this.darkModeState.asReadonly();

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle(DARK_MODE_CLASS, this.darkMode());
    });
  }

  /** Switches mode and remembers the choice (until then, the system preference applies). */
  setDarkMode(darkMode: boolean): void {
    this.darkModeState.set(darkMode);
    try {
      localStorage.setItem(STORAGE_KEY, String(darkMode));
    } catch {
      // Storage unavailable (e.g. privacy mode): the choice just isn't remembered.
    }
  }

  /** The last choice made with the toggle, otherwise the operating system preference. */
  private initialDarkMode(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {
      // Storage unavailable: fall back to the system preference.
    }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }
}
