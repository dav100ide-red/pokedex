---
name: primeng-21
description: PrimeNG 21 on Angular 21 for this project. Use before adding, configuring, theming or styling any PrimeNG component (providePrimeNG setup, theme presets, PrimeIcons, import paths, p-table, p-dialog, p-select, p-datepicker, forms, toast, confirm dialog). Covers the v21 specifics that differ from older PrimeNG versions.
---

# PrimeNG 21 in this project

Installed and pinned: `primeng` 21.1.10, `@primeuix/themes` 2.0.3, `primeicons` 8.0.2, `@angular/cdk` 21.
Nothing is wired up yet: no `providePrimeNG`, no theme, no icon stylesheet, no component in use.
Do not install packages. `@angular/animations` is absent on purpose: PrimeNG 21 uses native CSS
animations, so never add `provideAnimationsAsync()` even if older snippets show it.

## 1. One-time setup

`src/app/app.config.ts`:

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: 'system', cssLayer: false },
      },
    }),
  ],
};
```

Presets: `Aura` (PrimeTek default), `Material`, `Lara`, `Nora`, each importable from `@primeuix/themes/<name>`.
Options: `prefix` (CSS variable prefix, default `p`), `darkModeSelector` (`'system'` default,
a class such as `'.app-dark'` toggled on `<html>` for a manual switch, `false` to disable dark mode),
`cssLayer` (`false` default; `true` wraps PrimeNG styles in a `primeng` cascade layer so app CSS wins).
Extra config: `ripple: true`, `inputVariant: 'filled'`, `translation: {...}`, `zIndex`, `overlayAppendTo`.

Icons, in `src/styles.scss`:

```scss
@import "primeicons/primeicons.css";
```

Use icons as `<i class="pi pi-search"></i>` or `icon="pi pi-plus"` on components. `pi-spin` rotates.
Constants: `PrimeIcons.PLUS` from `primeng/api`.

## 2. Using a component

- Import the component's module from its own entry point and add it to the standalone component's
  `imports`: `import { ButtonModule } from 'primeng/button';`. Each component has one entry point
  (`primeng/table`, `primeng/dialog`, `primeng/select`, ...). Services live in `primeng/api`
  (`MessageService`, `ConfirmationService`, `MenuItem`, `PrimeIcons`, `FilterMatchMode`).
- Tags are `p-<name>` (`<p-button>`, `<p-table>`, `<p-select>`). Some components are directives on
  native elements: `pInputText` on `<input>`, `pTextarea` on `<textarea>`, `pButton` on `<button>`, `pTooltip`.
- Named templates use template references: `<ng-template #header>`, `#body let-row`, `#footer`,
  `#caption`, `#emptymessage`, `#filter`, `#item`, `#selectedItem`.
- Form components work with `[(ngModel)]` (import `FormsModule`) and with reactive forms
  (`formControlName`, import `ReactiveFormsModule`). Prefer reactive forms for create/edit dialogs.
- Signals: pass values, not signals: `[value]="pokemons()"`.
- Styling: prefer design tokens and the `dt` input over CSS overrides; `styleClass`/`class` to add
  app classes; `[pt]` pass-through to reach inner DOM elements.

Per-component import lines, key inputs, templates and minimal examples are in
`references/components.md` (Table, Dialog, Select, MultiSelect, DatePicker, ToggleSwitch, InputText,
InputNumber, Textarea, Checkbox, RadioButton, Button, Card, Tag, Chip, Badge, Avatar, Image, Toast,
Message, ConfirmDialog, Paginator, DataView, IconField, FloatLabel, Rating, Divider, Toolbar, Menubar,
Skeleton, ProgressSpinner, Tooltip, Panel, Fieldset, Drawer, Tabs). Anything else: read
`https://v21.primeng.org/<component>.md` (Markdown version of the v21 docs; stay on the `v21.primeng.org`
host, `primeng.org` now serves v22).

## 3. Feedback services

Toast: provide `MessageService` (in `providers` of the component or in `app.config.ts`), place
`<p-toast />` once (for example in `app.html`), then `messageService.add({ severity: 'success',
summary: 'Saved', detail: 'Pikachu updated' })`. Severities: `success`, `info`, `warn`, `error`,
`secondary`, `contrast`.

Confirm dialog: provide `ConfirmationService`, place `<p-confirmdialog />` once, then
`confirmationService.confirm({ message, header, icon: 'pi pi-exclamation-triangle', accept: () => ... })`.

## 4. Component picks for this app

| Need | Component |
|---|---|
| List of Pokémon with sort, filter, paginate, select | `p-table` (`[value]`, `[paginator]`, `[rows]`, `dataKey="id"`, `sortMode`, `[globalFilterFields]`, `[(selection)]`) |
| Card/grid layout with layout switch | `p-dataview` (`layout="grid"`/`"list"`, `#list`/`#grid` templates) or `p-card` in a CSS grid |
| Create/edit form in a modal | `p-dialog` (`[(visible)]`, `[modal]="true"`, `header`, `#footer`) + reactive form |
| Text, number, date, multi-value inputs | `pInputText`, `p-inputnumber`, `p-datepicker` (binds `Date`), `p-multiselect` (types, moves), `p-select` |
| Boolean flag such as favorite | `p-toggleswitch` or `p-checkbox` (`[binary]="true"`) |
| Labels | `p-tag` (`severity`, `value`, `icon`), `p-chip`, `p-badge` |
| Search box with icon | `p-iconfield` + `p-inputicon` + `pInputText` |
| Notifications and confirmations | `p-toast` + `MessageService`, `p-confirmdialog` + `ConfirmationService` |
| Loading | `p-skeleton`, `p-progressspinner` |
| Page chrome | `p-toolbar`, `p-menubar`, `p-divider` |

## 5. Pitfalls

- v21 removed the dependency on `@angular/animations`; `showTransitionOptions` / `hideTransitionOptions`
  are deprecated and ignored. Directive pass-through attributes use the `PT` suffix (`pInputTextPT`).
- `strictTemplates` is on: bind the types the component declares (for example `Date` for
  `p-datepicker`, `string[]` for `p-multiselect` values, `boolean` for `p-checkbox [binary]`).
- Keep component SCSS small: the production build fails if a component style exceeds 8 kB
  (`anyComponentStyle` budget in `angular.json`). Put shared styles in `src/styles.scss`.
- Remote sprite images are plain URLs: a plain `<img>` or `<p-image>` is fine; `NgOptimizedImage`
  needs width/height and is optional here.
- Run `npx ng build` after wiring PrimeNG: a wrong import path (`primeng/dropdown`, `primeng/calendar`,
  `primeng/inputswitch`, `primeng/sidebar`, `primeng/tabview`, `primeng/overlaypanel`) fails the build;
  the v21 names are `primeng/select`, `primeng/datepicker`, `primeng/toggleswitch`, `primeng/drawer`,
  `primeng/tabs`, `primeng/popover`.
