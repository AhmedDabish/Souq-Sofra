import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
  ProductReviewsSummary
} from '../models/models';

export interface OrderCreateResponse {
  success: boolean;
  orderId: number;
  orderNumber: string;
  total: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  // Matches Backend/SouqSofra.API/Properties/launchSettings.json
  private readonly apiUrl = 'http://localhost:2811/api';

  // Upload an image to the API's wwwroot/uploads directory.
  uploadImage(file: File, folder: 'products' | 'categories' | 'banners' | 'logo' = 'products'): Observable<{ url: string; fullUrl: string; fileName: string; folder: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string; fullUrl: string; fileName: string; folder: string }>(`${this.apiUrl}/upload?folder=${folder}`, form);
  }

  // -------------------------------------------------------------
  // Public Catalog & Storefront Endpoints
  // -------------------------------------------------------------

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }


  getAdminCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/admin/all`);
  }

  getProducts(categoryId?: number, featured?: boolean, search?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (categoryId !== undefined) params = params.set('categoryId', categoryId);
    if (featured !== undefined) params = params.set('featured', featured);
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
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
    return this.getSettings().pipe(map(settings => {
      try { return JSON.parse(settings['DeliveryZones'] || '[]') as DeliveryZone[]; } catch { return []; }
    }));
  }

  getSettings(): Observable<SiteSettings> {
    return this.http.get<SiteSettings>(`${this.apiUrl}/settings`);
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
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: ProductCreate): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
  }

  toggleProductAvailability(id: number): Observable<{ productId: number; isAvailable: boolean }> {
    return this.http.patch<{ productId: number; isAvailable: boolean }>(`${this.apiUrl}/products/${id}/availability`, {});
  }

  toggleProductFeatured(id: number): Observable<{ productId: number; isFeatured: boolean }> {
    return this.http.patch<{ productId: number; isFeatured: boolean }>(`${this.apiUrl}/products/${id}/featured`, {});
  }

  toggleProductBestSelling(id: number): Observable<{ productId: number; isManuallyBestSelling: boolean }> {
    return this.http.patch<{ productId: number; isManuallyBestSelling: boolean }>(`${this.apiUrl}/products/${id}/best-selling`, {});
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
    return this.http.patch<{ productId: number; discountPrice: number | null }>(`${this.apiUrl}/products/${id}/discount`, { discountPrice });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  createCategory(category: CategoryCreate): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  updateCategory(id: number, category: CategoryCreate): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
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
    });
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
}
