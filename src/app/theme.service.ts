import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

/** Class toggled on <html>; it is also the darkModeSelector given to PrimeNG. */
export const DARK_MODE_CLASS = 'app-dark';

const STORAGE_KEY = 'pokedex-color-scheme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly state = signal(false);

  readonly darkMode = this.state.asReadonly();

  /** Applies the saved color scheme, or the system one when nothing was saved yet. */
  restore(): void {
    this.apply(this.readSavedPreference() ?? this.prefersDarkScheme());
  }

  setDarkMode(enabled: boolean): void {
    this.apply(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'dark' : 'light');
    } catch {
      // Storage can be unavailable (e.g. blocked cookies): the choice just won't persist.
    }
  }

  private apply(enabled: boolean): void {
    this.state.set(enabled);
    this.document.documentElement.classList.toggle(DARK_MODE_CLASS, enabled);
  }

  private readSavedPreference(): boolean | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? saved === 'dark' : null;
    } catch {
      return null;
    }
  }

  private prefersDarkScheme(): boolean {
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }
}
