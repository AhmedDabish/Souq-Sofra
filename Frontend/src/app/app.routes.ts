import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/pages/home/home.component';
import { MenuComponent } from './features/public/pages/menu/menu.component';
import { ProductDetailComponent } from './features/public/pages/product-detail/product-detail.component';
import { CheckoutComponent } from './features/public/pages/checkout/checkout.component';
import { ContactComponent } from './features/public/pages/contact/contact.component';
import { DashboardComponent } from './features/admin/pages/dashboard/dashboard.component';
import { AdminLoginComponent } from './features/admin/pages/login/admin-login.component';
import { AdminOrdersComponent } from './features/admin/pages/orders/admin-orders.component';
import { AdminProductsComponent } from './features/admin/pages/products/admin-products.component';
import { AdminSettingsComponent } from './features/admin/pages/settings/admin-settings.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Storefront Routes
  { path: '', component: HomeComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'contact', component: ContactComponent },

  // Admin Dashboard Routes (Isolated & Protected via authGuard)
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [authGuard] },
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [authGuard] },
  { path: 'admin/settings', component: AdminSettingsComponent, canActivate: [authGuard] },

  // Fallback
  { path: '**', redirectTo: '' }
];
