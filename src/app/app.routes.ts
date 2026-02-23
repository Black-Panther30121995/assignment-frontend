import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/devices/devices-list.component').then(m => m.DevicesListComponent) },
  { path: 'devices/new', loadComponent: () => import('./features/devices/device-form.component').then(m => m.DeviceFormComponent) },
  { path: 'devices/:deviceId', loadComponent: () => import('./features/devices/device-summary.component').then(m => m.DeviceSummaryComponent) },
  { path: 'shelves/new', loadComponent: () => import('./features/shelves/shelf-form.component').then(m => m.ShelfFormComponent) },
  { path: 'shelves/:shelfId', loadComponent: () => import('./features/shelves/shelf-summary.component').then(m => m.ShelfSummaryComponent) },
  { path: '**', redirectTo: '' }
];