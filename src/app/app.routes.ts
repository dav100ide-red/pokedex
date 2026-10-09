import { Routes } from '@angular/router';

export const routes: Routes = [
  // Lazy loaded: the page pulls in most of the PrimeNG components used by the app.
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
];
