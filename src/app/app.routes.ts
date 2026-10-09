import { Routes } from '@angular/router';

export const routes: Routes = [
  // Lazy loaded so the PrimeNG components stay out of the initial bundle budget.
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
];
