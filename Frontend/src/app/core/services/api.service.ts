import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, startWith, tap, throwError } from 'rxjs';
import {
  Category,
  CategoryCreate,
  Product,
  ProductCreate,
  OrderCreate,
  AdminOrder,
  Branch,
  SiteSettings,
  StaffUser,
  PermissionDefinition,
  AddonTemplate,
  AddonTemplateCreate,
  DeliveryZone,
  RestaurantReview,
  ProductReview,
  ProductReviewCreate,
  ProductReviewsSummary,
  AdminReview,
  AdminReviewCreate
} from '../models/models';
import { mergeDeliveryZones, readDeliveryZones } from '../utils/delivery-zone-settings';

export interface OrderCreateResponse {
  success: boolean;
  orderId: number;
  orderNumber: string;
  total: number;
  message?: string;
}

export interface SiteAnalytics {
  periodStart: string;
  periodEnd: string;
  visits: number;
  uniqueVisitors: number;
  completedOrders: number;
  completedRevenue: number;
  averageCompletedOrder: number;
  ordersFromWebsite: number;
  ordersFromWhatsApp: number;
  productSales: Array<{ productId: number; nameAr: string; nameEn: string; unitsSold: number; completedOrders: number; orderSharePercent: number; productPageViews: number }>;
  dailyVisits: Array<{ date: string; visits: number; uniqueVisitors: number }> ;
  topPages: Array<{ path: string; displayNameAr?: string | null; displayNameEn?: string | null; visits: number; uniqueVisitors: number }> ;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  // Matches Backend/SouqSofra.API/Properties/launchSettings.json
  private readonly apiUrl = 'http://localhost:2811/api';
  private productsCache$: Observable<Product[]> | null = null;
  private productsCacheExpiresAt = 0;
  private readonly productsStorageKey = 'souq-sofra-products-cache-v1';
  private categoriesCache$: Observable<Category[]> | null = null;
  private categoriesCacheExpiresAt = 0;
  private readonly categoriesStorageKey = 'souq-sofra-categories-cache-v1';
  private settingsCache$: Observable<SiteSettings> | null = null;
  private settingsCacheExpiresAt = 0;
  private readonly settingsStorageKey = 'souq-sofra-settings-cache-v1';

  private invalidateProductsCache(): void {
    this.productsCache$ = null;
    this.productsCacheExpiresAt = 0;
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem(this.productsStorageKey); } catch { /* storage may be unavailable */ }
  }

  // Upload an image to the API's wwwroot/uploads directory.
  uploadImage(file: File, folder: 'products' | 'categories' | 'banners' | 'logo' = 'products'): Observable<{ url: string; fullUrl: string; fileName: string; folder: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string; fullUrl: string; fileName: string; folder: string }>(`${this.apiUrl}/upload?folder=${folder}`, form);
  }

  // -------------------------------------------------------------
  // Public Catalog & Storefront Endpoints
  // -------------------------------------------------------------

  recordPageView(sessionKey: string, pagePath: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/analytics/visit`, { sessionKey, pagePath });
  }

  getAnalytics(fromDate?: string, toDate?: string): Observable<SiteAnalytics> {
    let params = new HttpParams();
    if (fromDate) params = params.set('from', fromDate);
    if (toDate) params = params.set('to', toDate);
    return this.http.get<SiteAnalytics>(`${this.apiUrl}/analytics`, { params });
  }

  getCategories(): Observable<Category[]> {
    if (this.categoriesCache$ && this.categoriesCacheExpiresAt > Date.now()) return this.categoriesCache$;

    let staleCategories: Category[] | null = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.categoriesStorageKey);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) staleCategories = parsed as Category[];
        }
      }
    } catch { /* ignore malformed or unavailable browser storage */ }

    this.categoriesCacheExpiresAt = Date.now() + 5 * 60_000;
    this.categoriesCache$ = this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      tap(categories => {
        try { if (typeof localStorage !== 'undefined') localStorage.setItem(this.categoriesStorageKey, JSON.stringify(categories)); } catch { /* storage quota or privacy mode */ }
      }),
      catchError(error => {
        this.categoriesCache$ = null;
        this.categoriesCacheExpiresAt = 0;
        return staleCategories ? of(staleCategories) : throwError(() => error);
      }),
      startWith(...(staleCategories ? [staleCategories] : [])),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.categoriesCache$;
  }

  private invalidateCategoriesCache(): void {
    this.categoriesCache$ = null;
    this.categoriesCacheExpiresAt = 0;
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem(this.categoriesStorageKey); } catch { /* storage may be unavailable */ }
  }


  getAdminCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/admin/all`);
  }

  getProducts(categoryId?: number, featured?: boolean, search?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (categoryId !== undefined) params = params.set('categoryId', categoryId);
    if (featured !== undefined) params = params.set('featured', featured);
    if (search?.trim()) params = params.set('search', search.trim());

    const isFullCatalog = categoryId === undefined && featured === undefined && !search?.trim();
    if (isFullCatalog && this.productsCache$ && this.productsCacheExpiresAt > Date.now()) {
      return this.productsCache$;
    }

    const request$ = this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
    if (!isFullCatalog) return request$;

    let staleProducts: Product[] | null = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.productsStorageKey);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) staleProducts = parsed as Product[];
        }
      }
    } catch { /* ignore malformed or unavailable browser storage */ }

    this.productsCacheExpiresAt = Date.now() + 30_000;
    this.productsCache$ = request$.pipe(
      tap(products => {
        try { if (typeof localStorage !== 'undefined') localStorage.setItem(this.productsStorageKey, JSON.stringify(products)); } catch { /* storage quota or privacy mode */ }
      }),
      catchError(error => {
        this.productsCache$ = null;
        this.productsCacheExpiresAt = 0;
        return staleProducts ? of(staleProducts) : throwError(() => error);
      }),
      startWith(...(staleProducts ? [staleProducts] : [])),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.productsCache$;
  }

  getBestSellingProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/best-selling`);
  }

  createOrder(order: OrderCreate): Observable<OrderCreateResponse> {
    const endpoint = order.orderChannel === 'WhatsApp' ? `${this.apiUrl}/orders/whatsapp` : `${this.apiUrl}/orders`;
    return this.http.post<OrderCreateResponse>(endpoint, order);
  }

  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches`);
  }

  getDeliveryZones(): Observable<DeliveryZone[]> {
    return this.getSettings().pipe(map(settings => mergeDeliveryZones(readDeliveryZones(settings))));
  }

  updateSettings(settings: Record<string, string>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/settings/bulk`, settings).pipe(tap(() => this.invalidateSettingsCache()));
  }

  getSettings(): Observable<SiteSettings> {
    if (this.settingsCache$ && this.settingsCacheExpiresAt > Date.now()) return this.settingsCache$;

    let staleSettings: SiteSettings | null = null;
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.settingsStorageKey);
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) staleSettings = parsed as SiteSettings;
        }
      }
    } catch { /* ignore malformed or unavailable browser storage */ }

    this.settingsCacheExpiresAt = Date.now() + 60_000;
    this.settingsCache$ = this.http.get<SiteSettings>(`${this.apiUrl}/settings`).pipe(
      tap(settings => {
        try { if (typeof localStorage !== 'undefined') localStorage.setItem(this.settingsStorageKey, JSON.stringify(settings)); } catch { /* storage may be unavailable */ }
      }),
      catchError(error => {
        this.settingsCache$ = null;
        this.settingsCacheExpiresAt = 0;
        return staleSettings ? of(staleSettings) : throwError(() => error);
      }),
      startWith(...(staleSettings ? [staleSettings] : [])),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    return this.settingsCache$;
  }

  private invalidateSettingsCache(): void {
    this.settingsCache$ = null;
    this.settingsCacheExpiresAt = 0;
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem(this.settingsStorageKey); } catch { /* storage may be unavailable */ }
  }

  // -------------------------------------------------------------
  // Admin Products & Categories Endpoints
  // -------------------------------------------------------------

  getAllAdminProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/admin/all`);
  }

  getAddonTemplates(): Observable<AddonTemplate[]> {
    return this.http.get<AddonTemplate[]>(`${this.apiUrl}/addons`);
  }

  createAddonTemplate(addon: AddonTemplateCreate): Observable<AddonTemplate> {
    return this.http.post<AddonTemplate>(`${this.apiUrl}/addons`, addon);
  }

  updateAddonTemplate(id: number, addon: AddonTemplateCreate): Observable<AddonTemplate> {
    return this.http.put<AddonTemplate>(`${this.apiUrl}/addons/${id}`, addon);
  }

  deleteAddonTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addons/${id}`);
  }

  getApplicableAddonTemplates(categoryId: number, productId?: number): Observable<AddonTemplate[]> {
    let params = new HttpParams().set('categoryId', categoryId);
    if (productId !== undefined) params = params.set('productId', productId);
    return this.http.get<AddonTemplate[]>(`${this.apiUrl}/addons/available`, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: ProductCreate): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product).pipe(tap(() => this.invalidateProductsCache()));
  }

  updateProduct(id: number, product: ProductCreate): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product).pipe(tap(() => this.invalidateProductsCache()));
  }

  toggleProductAvailability(id: number): Observable<{ productId: number; isAvailable: boolean }> {
    return this.http.patch<{ productId: number; isAvailable: boolean }>(`${this.apiUrl}/products/${id}/availability`, {}).pipe(tap(() => this.invalidateProductsCache()));
  }

  toggleProductFeatured(id: number): Observable<{ productId: number; isFeatured: boolean }> {
    return this.http.patch<{ productId: number; isFeatured: boolean }>(`${this.apiUrl}/products/${id}/featured`, {}).pipe(tap(() => this.invalidateProductsCache()));
  }

  toggleProductBestSelling(id: number): Observable<{ productId: number; isManuallyBestSelling: boolean }> {
    return this.http.patch<{ productId: number; isManuallyBestSelling: boolean }>(`${this.apiUrl}/products/${id}/best-selling`, {}).pipe(tap(() => this.invalidateProductsCache()));
  }

  bootstrapSuperAdmin(currentPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/users/bootstrap-super-admin`, { currentPassword, newPassword });
  }
  getStaffUsers(): Observable<StaffUser[]> { return this.http.get<StaffUser[]>(`${this.apiUrl}/users`); }
  getPermissionCatalog(): Observable<PermissionDefinition[]> { return this.http.get<PermissionDefinition[]>(`${this.apiUrl}/users/permissions/catalog`); }
  updateStaffPermissions(id: number, permissions: string[]): Observable<{ userId: number; permissions: string[] }> {
    return this.http.put<{ userId: number; permissions: string[] }>(`${this.apiUrl}/users/${id}/permissions`, { permissions });
  }
  createStaffUser(user: { fullName: string; email: string; password: string; phoneNumber?: string; role: string }): Observable<StaffUser> {
    return this.http.post<StaffUser>(`${this.apiUrl}/users`, user);
  }
  updateStaffRole(id: number, role: string): Observable<{ userId: number; role: string }> {
    return this.http.patch<{ userId: number; role: string }>(`${this.apiUrl}/users/${id}/role`, { role });
  }
  toggleStaffActive(id: number): Observable<{ userId: number; isActive: boolean }> {
    return this.http.patch<{ userId: number; isActive: boolean }>(`${this.apiUrl}/users/${id}/active`, {});
  }
  deleteStaffUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }


  updateProductDiscount(id: number, discountPrice: number | null): Observable<{ productId: number; discountPrice: number | null }> {
    return this.http.patch<{ productId: number; discountPrice: number | null }>(`${this.apiUrl}/products/${id}/discount`, { discountPrice }).pipe(tap(() => this.invalidateProductsCache()));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`).pipe(tap(() => this.invalidateProductsCache()));
  }

  createCategory(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category).pipe(tap(() => this.invalidateCategoriesCache()));
  }

  updateCategory(id: number, category: CategoryCreate): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category).pipe(tap(() => this.invalidateCategoriesCache()));
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`).pipe(tap(() => this.invalidateCategoriesCache()));
  }

  // -------------------------------------------------------------
  // Admin Orders Endpoints
  // -------------------------------------------------------------

  getAdminOrders(): Observable<AdminOrder[]> {
    return this.http.get<AdminOrder[]>(`${this.apiUrl}/orders`);
  }

  getOrderById(id: number): Observable<AdminOrder> {
    return this.http.get<AdminOrder>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<{ success: boolean; orderId: number; status: string }> {
    return this.http.patch<{ success: boolean; orderId: number; status: string }>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orders/${id}`);
  }

  // -------------------------------------------------------------
  // Admin Settings & Branches Endpoints
  // -------------------------------------------------------------

  updateSetting(key: string, value: string): Observable<{ settingKey: string; settingValue: string }> {
    return this.http.put<{ settingKey: string; settingValue: string }>(`${this.apiUrl}/settings`, {
      settingKey: key,
      settingValue: value
    }).pipe(tap(() => this.invalidateSettingsCache()));
  }

  getAdminBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(`${this.apiUrl}/branches/admin/all`);
  }

  createBranch(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiUrl}/branches`, branch);
  }

  updateBranch(id: number, branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/branches/${id}`, branch);
  }

  deleteBranch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/branches/${id}`);
  }

  // -------------------------------------------------------------
  // Reviews & Ratings Endpoints
  // -------------------------------------------------------------

  getRestaurantReviews(): Observable<RestaurantReview[]> {
    return this.http.get<RestaurantReview[]>(`${this.apiUrl}/reviews/restaurant`);
  }

  createRestaurantReview(formData: FormData): Observable<RestaurantReview> {
    return this.http.post<RestaurantReview>(`${this.apiUrl}/reviews/restaurant`, formData);
  }

  getProductReviews(productId: number): Observable<ProductReviewsSummary> {
    return this.http.get<ProductReviewsSummary>(`${this.apiUrl}/reviews/product/${productId}`);
  }

  createProductReview(review: ProductReviewCreate): Observable<ProductReview> {
    return this.http.post<ProductReview>(`${this.apiUrl}/reviews/product`, review);
  }

  getAdminReviews(): Observable<AdminReview[]> { return this.http.get<AdminReview[]>(`${this.apiUrl}/reviews/admin/all`); }
  createAdminReview(review: AdminReviewCreate): Observable<{ id: number }> { return this.http.post<{ id: number }>(`${this.apiUrl}/reviews/admin`, review); }
  updateAdminReview(id: number, type: AdminReview['type'], review: AdminReviewCreate): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/reviews/admin/${type}/${id}`, review);
  }
  deleteAdminReview(type: AdminReview['type'], id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/reviews/admin/${type}/${id}`); }
}
