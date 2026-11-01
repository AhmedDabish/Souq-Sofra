import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/pages/home/home.component';
import { DashboardComponent } from './features/admin/pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'menu', component: HomeComponent },
  { path: 'admin', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];
