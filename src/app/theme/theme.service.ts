import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

/** Class set on `<html>` in dark mode; PrimeNG uses it as its dark mode selector. */
export const DARK_MODE_CLASS = 'app-dark';

const STORAGE_KEY = 'pokedex-color-scheme';

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

  setDarkMode(darkMode: boolean): void {
    this.darkModeState.set(darkMode);
    localStorage.setItem(STORAGE_KEY, darkMode ? 'dark' : 'light');
  }

  /** The user's last explicit choice, falling back to the operating system preference. */
  private initialDarkMode(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored === 'dark';
    }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }
}
