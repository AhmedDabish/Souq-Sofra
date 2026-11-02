import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/pages/home/home.component';
import { MenuComponent } from './features/public/pages/menu/menu.component';
import { ProductDetailComponent } from './features/public/pages/product-detail/product-detail.component';
import { CheckoutComponent } from './features/public/pages/checkout/checkout.component';
import { CartPageComponent } from './features/public/pages/cart/cart-page.component';
import { ContactComponent } from './features/public/pages/contact/contact.component';
import { DashboardComponent } from './features/admin/pages/dashboard/dashboard.component';
import { AdminLoginComponent } from './features/admin/pages/login/admin-login.component';
import { AdminOrdersComponent } from './features/admin/pages/orders/admin-orders.component';
import { AdminProductsComponent } from './features/admin/pages/products/admin-products.component';
import { AdminCategoriesComponent } from './features/admin/pages/categories/admin-categories.component';
import { AdminSettingsComponent } from './features/admin/pages/settings/admin-settings.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Storefront Routes
  { path: '', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'contact', component: ContactComponent },

  // Admin Dashboard Routes (Isolated & Protected via authGuard)
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: DashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'] } },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/categories', component: AdminCategoriesComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/addons', loadComponent: () => import('./features/admin/pages/addons/admin-addons.component').then(m => m.AdminAddonsComponent), canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/settings', component: AdminSettingsComponent, canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/staff', loadComponent: () => import('./features/admin/pages/staff/admin-staff.component').then(m => m.AdminStaffComponent), canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'SuperAdmin'] } },

  // Fallback
  { path: '**', redirectTo: '' }
];
