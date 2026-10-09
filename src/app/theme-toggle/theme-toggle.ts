import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ThemeService } from '../theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [ReactiveFormsModule, ToggleSwitchModule],
  template: `
    <label for="dark-mode">Dark mode</label>
    <p-toggleswitch inputId="dark-mode" [formControl]="darkMode">
      <ng-template #handle let-checked="checked">
        <i
          class="pi handle-icon"
          [class.pi-moon]="checked"
          [class.pi-sun]="!checked"
          aria-hidden="true"
        ></i>
      </ng-template>
    </p-toggleswitch>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .handle-icon {
      font-size: 0.625rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private readonly themeService = inject(ThemeService);

  protected readonly darkMode = new FormControl(this.themeService.darkMode(), {
    nonNullable: true,
  });

  constructor() {
    this.darkMode.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((dark) => this.themeService.setDarkMode(dark));
  }
}
