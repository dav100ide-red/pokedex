import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

/** Class toggled on <html>; PrimeNG uses it as its dark mode selector. */
export const DARK_MODE_CLASS = 'app-dark';

const STORAGE_KEY = 'pokedex-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly state = signal(this.initialDarkMode());

  readonly darkMode = this.state.asReadonly();

  constructor() {
    effect(() => this.document.documentElement.classList.toggle(DARK_MODE_CLASS, this.state()));
  }

  setDarkMode(darkMode: boolean): void {
    this.state.set(darkMode);
    localStorage.setItem(STORAGE_KEY, String(darkMode));
  }

  /** The user's last choice, falling back to the system preference. */
  private initialDarkMode(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }
}
