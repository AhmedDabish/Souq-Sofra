import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public storefront screens load only when the visitor opens them.
  { path: '', loadComponent: () => import('./features/public/pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'menu', loadComponent: () => import('./features/public/pages/menu/menu.component').then(m => m.MenuComponent) },
  { path: 'product/:id', loadComponent: () => import('./features/public/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'cart', loadComponent: () => import('./features/public/pages/cart/cart-page.component').then(m => m.CartPageComponent) },
  { path: 'checkout', redirectTo: 'cart', pathMatch: 'full' },
  { path: 'contact', loadComponent: () => import('./features/public/pages/contact/contact.component').then(m => m.ContactComponent) },

  // Admin routes remain protected; their screen code is fetched only after navigation.
  { path: 'admin/login', loadComponent: () => import('./features/admin/pages/login/admin-login.component').then(m => m.AdminLoginComponent) },
  { path: 'admin', loadComponent: () => import('./features/admin/pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'dashboard.view' } },
  { path: 'admin/orders', loadComponent: () => import('./features/admin/pages/orders/admin-orders.component').then(m => m.AdminOrdersComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'orders.view' } },
  { path: 'admin/all-orders', loadComponent: () => import('./features/admin/pages/all-orders/admin-all-orders.component').then(m => m.AdminAllOrdersComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'orders.view' } },
  { path: 'admin/products', loadComponent: () => import('./features/admin/pages/products/admin-products.component').then(m => m.AdminProductsComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'products.view' } },
  { path: 'admin/categories', loadComponent: () => import('./features/admin/pages/categories/admin-categories.component').then(m => m.AdminCategoriesComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'categories.view' } },
  { path: 'admin/addons', loadComponent: () => import('./features/admin/pages/addons/admin-addons.component').then(m => m.AdminAddonsComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'addons.view' } },
  { path: 'admin/settings', loadComponent: () => import('./features/admin/pages/settings/admin-settings.component').then(m => m.AdminSettingsComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'settings.view' } },
  { path: 'admin/delivery-settings', loadComponent: () => import('./features/admin/pages/delivery-settings/admin-delivery-settings.component').then(m => m.AdminDeliverySettingsComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'settings.view' } },
  { path: 'admin/analytics', loadComponent: () => import('./features/admin/pages/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'analytics.view' } },
  { path: 'admin/export', loadComponent: () => import('./features/admin/pages/export/admin-export.component').then(m => m.AdminExportComponent), canActivate: [authGuard, roleGuard], data: { roles: ['Admin', 'SuperAdmin'] } },
  { path: 'admin/developer-logs', loadComponent: () => import('./features/admin/pages/developer-logs/developer-logs.component').then(m => m.DeveloperLogsComponent), canActivate: [authGuard, roleGuard], data: { roles: ['SuperAdmin'], developerOnly: true } },
  { path: 'admin/reviews', loadComponent: () => import('./features/admin/pages/reviews/admin-reviews.component').then(m => m.AdminReviewsComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'reviews.view' } },
  { path: 'admin/staff', loadComponent: () => import('./features/admin/pages/staff/admin-staff.component').then(m => m.AdminStaffComponent), canActivate: [authGuard, roleGuard], data: { roles: ['User', 'Admin', 'SuperAdmin'], permission: 'users.view' } },

  // Fallback
  { path: '**', redirectTo: '' }
];
