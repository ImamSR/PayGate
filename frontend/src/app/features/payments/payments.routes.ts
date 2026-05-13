import { Routes } from '@angular/router';

export const PAYMENT_ROUTES: Routes = [
  {
    path: 'new',
    loadComponent: () => import('./payment-form/payment-form.component').then(m => m.PaymentFormComponent)
  },
  {
    path: '',
    redirectTo: 'new',
    pathMatch: 'full'
  }
];