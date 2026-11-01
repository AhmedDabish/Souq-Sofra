import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Product } from '../../../../core/models/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex" dir="rtl">
      
      <!-- Sidebar -->
      <aside class="w-64 bg-primaryDark text-white flex flex-col justify-between p-6">
        <div>
          <div class="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
            <img src="assets/MAIN.jpg" class="w-10 h-10 rounded-full">
            <div>
              <h2 class="font-bold text-sm font-baloo">سوق وسفرة الإدارة</h2>
              <span class="text-[10px] text-gray-400">لوحة التحكم الشاملة</span>
            </div>
          </div>

          <nav class="space-y-2">
            <a routerLink="/admin" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 text-sm font-medium">
              <span>📊</span>
              <span>الإحصائيات العامة</span>
            </a>
            <a routerLink="/admin/products" class="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold">
              <span>🍔</span>
              <span>إدارة المنتجات والمنيو</span>
            </a>
            <a routerLink="/admin/orders" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 text-sm font-medium">
              <span>📦</span>
              <span>الطلبات المباشرة</span>
            </a>
          </nav>
        </div>

        <a routerLink="/" class="text-xs text-gray-400 hover:text-white flex items-center gap-2">
          <span>←</span>
          <span>العودة للمتجر العام</span>
        </a>
      </aside>

      <!-- Main Products Content -->
      <main class="flex-1 p-8">
        <header class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-black font-baloo text-gray-800">إدارة أصناف ومنتجات المنيو</h1>
            <p class="text-xs text-gray-400">تعديل الأسعار والتوفر والعروض الترويجية</p>
          </div>
          <button class="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primaryHover text-white font-bold text-xs shadow-md transition-all">
            + إضافة صنف جديد
          </button>
        </header>

        <div class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <table class="w-full text-right text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th class="p-4">الصنف</th>
                <th class="p-4">السعر الأساسي</th>
                <th class="p-4">الحالة</th>
                <th class="p-4">مميز (Featured)</th>
                <th class="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (prod of products(); track prod.productId) {
                <tr>
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <img [src]="prod.imageUrl || 'assets/MAIN.jpg'" class="w-10 h-10 rounded-xl object-cover">
                      <div>
                        <div class="font-bold text-xs text-gray-800">{{ prod.nameAr }}</div>
                        <div class="text-[10px] text-gray-400">{{ prod.nameEn }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 font-bold text-primary">{{ prod.basePrice }} درهم</td>
                  <td class="p-4">
                    <button 
                      (click)="toggleAvailability(prod)"
                      [class]="prod.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="text-xs px-2.5 py-1 rounded-full font-bold">
                      {{ prod.isAvailable ? 'متوفر' : 'غير متوفر' }}
                    </button>
                  </td>
                  <td class="p-4">
                    <span [class]="prod.isFeatured ? 'text-amber-500 font-bold' : 'text-gray-300'">
                      {{ prod.isFeatured ? '⭐ نعم' : '—' }}
                    </span>
                  </td>
                  <td class="p-4">
                    <div class="flex items-center gap-2 text-xs">
                      <button class="text-blue-600 hover:underline">تعديل</button>
                      <button class="text-red-500 hover:underline">حذف</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </main>

    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  private api = inject(ApiService);
  products = signal<Product[]>([]);

  ngOnInit() {
    this.api.getProducts().subscribe(p => this.products.set(p));
  }

  toggleAvailability(prod: Product) {
    const list = this.products().map(p => p.productId === prod.productId ? { ...p, isAvailable: !p.isAvailable } : p);
    this.products.set(list);
  }
}
