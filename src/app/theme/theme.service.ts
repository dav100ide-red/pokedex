import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

/** Class on <html> that switches PrimeNG to its dark color scheme (see `darkModeSelector`). */
export const DARK_MODE_CLASS = 'app-dark';

const STORAGE_KEY = 'pokedex-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly state = signal(initialDarkMode());

  readonly darkMode = this.state.asReadonly();

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle(DARK_MODE_CLASS, this.state());
    });
  }

  setDarkMode(darkMode: boolean): void {
    this.state.set(darkMode);
    localStorage.setItem(STORAGE_KEY, String(darkMode));
  }
}

/** The user's saved choice, falling back to the system preference. */
function initialDarkMode(): boolean {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === null ? matchMedia('(prefers-color-scheme: dark)').matches : saved === 'true';
}
