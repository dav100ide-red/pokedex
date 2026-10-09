import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

/** Class set on `<html>` in dark mode; PrimeNG's `darkModeSelector` points at it. */
export const DARK_MODE_CLASS = 'app-dark';

const STORAGE_KEY = 'pokedex-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly dark = signal(this.readStoredPreference() ?? this.prefersDarkScheme());

  readonly darkMode = this.dark.asReadonly();

  constructor() {
    effect(() => {
      const dark = this.dark();
      this.document.documentElement.classList.toggle(DARK_MODE_CLASS, dark);
      this.storePreference(dark);
    });
  }

  setDarkMode(dark: boolean): void {
    this.dark.set(dark);
  }

  private prefersDarkScheme(): boolean {
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }

  // Storage access throws when the browser blocks it: the choice is then simply not remembered.
  private readStoredPreference(): boolean | null {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return stored ? stored === 'true' : null;
    } catch {
      return null;
    }
  }

  private storePreference(dark: boolean): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, String(dark));
    } catch {
      // See readStoredPreference.
    }
  }
}
