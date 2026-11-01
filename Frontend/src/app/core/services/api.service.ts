import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Product, OrderCreate } from '../models/models';

export interface OrderCreateResponse {
  success: boolean;
  orderId: number;
  orderNumber: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  // Matches Backend/SouqSofra.API/Properties/launchSettings.json.
  private readonly apiUrl = 'http://localhost:2811/api';

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getProducts(categoryId?: number, featured?: boolean, search?: string): Observable<Product[]> {
    let params = new HttpParams();
    if (categoryId !== undefined) params = params.set('categoryId', categoryId);
    if (featured !== undefined) params = params.set('featured', featured);
    if (search?.trim()) params = params.set('search', search.trim());
    return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
  }

  createOrder(order: OrderCreate): Observable<OrderCreateResponse> {
    return this.http.post<OrderCreateResponse>(`${this.apiUrl}/orders`, order);
  }
}
