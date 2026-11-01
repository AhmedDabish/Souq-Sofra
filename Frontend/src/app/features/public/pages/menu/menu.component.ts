import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Category, Product } from '../../../../core/models/models';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="container-wide mx-auto px-2 md:px-4 py-8 sm:py-12 space-y-8">
      
      <!-- Page Header & Search -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 class="text-3xl font-extrabold font-baloo text-primaryDark">قائمة طعام سوق وسفرة</h1>
          <p class="text-xs text-gray-500 mt-1">
            اختر من بين أشهى الفطائر المشلتتة، المناقيش، الحلويات الشرقية، وسندوتشات الكبدة والحواوشي.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80">
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            placeholder="ابحث عن وجبة أو صنف..."
            class="w-full px-4 py-2.5 pr-10 rounded-2xl border border-gray-200 focus:outline-none focus:border-primary text-xs bg-white shadow-xs">
          <svg class="absolute right-3 top-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          type="button"
          (click)="selectedCategoryId.set(null)"
          [class]="selectedCategoryId() === null ? 'bg-primary text-white font-bold shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-secondary'"
          class="px-4 py-2 rounded-2xl text-xs whitespace-nowrap transition-all">
          جميع الأقسام (الكل)
        </button>

        @for (cat of categories(); track cat.categoryId) {
          <button 
            type="button"
            (click)="selectedCategoryId.set(cat.categoryId)"
            [class]="selectedCategoryId() === cat.categoryId ? 'bg-primary text-white font-bold shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-secondary'"
            class="px-4 py-2 rounded-2xl text-xs whitespace-nowrap transition-all">
            {{ cat.nameAr }}
          </button>
        }
      </div>

      <!-- Products Grid -->
      @if (filteredProducts().length === 0) {
        <div class="p-12 text-center bg-white rounded-3xl border border-gray-100 space-y-3">
          <div class="text-3xl">🔍</div>
          <h3 class="font-bold text-gray-700 text-base">لا توجد نتائج مطابقة للبحث</h3>
          <p class="text-xs text-gray-400">جرب البحث بكلمة أخرى أو اختر قسماً آخر.</p>
        </div>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          @for (prod of filteredProducts(); track prod.productId) {
            <app-product-card [product]="prod"></app-product-card>
          }
        </div>
      }

    </div>
  `
})
export class MenuComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  selectedCategoryId = signal<number | null>(null);
  searchQuery = '';

  filteredProducts = computed(() => {
    let list = this.products();
    const catId = this.selectedCategoryId();
    if (catId !== null) {
      list = list.filter(p => p.categoryId === catId);
    }
    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(p => p.nameAr.toLowerCase().includes(q) || (p.nameEn && p.nameEn.toLowerCase().includes(q)));
    }
    return list;
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['search']) this.searchQuery = params['search'];
      if (params['categoryId']) this.selectedCategoryId.set(Number(params['categoryId']));
    });
    this.api.getCategories().subscribe(c => this.categories.set(c));
    this.api.getProducts().subscribe(p => this.products.set(p));
  }
}
