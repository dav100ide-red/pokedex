import { Routes } from '@angular/router';

export const routes: Routes = [
  // Lazy-loaded so the page and its PrimeNG components stay out of the initial bundle.
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
];
