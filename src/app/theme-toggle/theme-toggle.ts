import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

/** Must match `darkModeSelector` in app.config.ts. */
const DARK_MODE_CLASS = 'app-dark';

@Component({
  selector: 'app-theme-toggle',
  imports: [FormsModule, ToggleSwitchModule],
  template: `
    <label for="dark-mode-toggle"><i class="pi pi-moon" aria-hidden="true"></i> Dark mode</label>
    <p-toggleswitch inputId="dark-mode-toggle" [(ngModel)]="darkMode" />
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private readonly document = inject(DOCUMENT);

  /** Starts from the operating system preference. */
  protected readonly darkMode = signal(
    this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false,
  );

  constructor() {
    effect(() => {
      this.document.documentElement.classList.toggle(DARK_MODE_CLASS, this.darkMode());
    });
  }
}
