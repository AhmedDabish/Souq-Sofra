import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { CategorySliderComponent } from '../../components/category-slider/category-slider.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Category, Product } from '../../../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroSliderComponent, CategorySliderComponent, ProductCardComponent],
  template: `
    <app-hero-slider></app-hero-slider>

    <app-category-slider 
      [categories]="categories()" 
      [selectedId]="selectedCategoryId()"
      (categorySelected)="onCategorySelect($event)">
    </app-category-slider>

    <!-- Product Grid Section - Full Fluid Widescreen -->
    <div id="menu-section" class="container-wide mx-auto px-2 md:px-4 py-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        @for (prod of filteredProducts(); track prod.productId) {
          <app-product-card [product]="prod"></app-product-card>
        }
      </div>
    </div>

    <!-- Features Banner -->
    <div class="container-wide mx-auto px-2 md:px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div class="bg-white p-6 rounded-3xl shadow-xs border border-gray-100">
          <div class="w-12 h-12 bg-primary/20 text-primaryDark rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">🥖</div>
          <h3 class="font-bold text-base mb-1">مخبوزات طازجة يومياً</h3>
          <p class="text-xs text-gray-500">نخبز يومياً بأجود المكونات الطبيعية على الطريقة التقليدية.</p>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-xs border border-gray-100">
          <div class="w-12 h-12 bg-primary/20 text-primaryDark rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">⚡</div>
          <h3 class="font-bold text-base mb-1">توصيل سريع وساخن</h3>
          <p class="text-xs text-gray-500">تصلك طلباتك بأقصى سرعة وهي ساخنة وطازجة مباشرة من الفرن.</p>
        </div>
        <div class="bg-white p-6 rounded-3xl shadow-xs border border-gray-100">
          <div class="w-12 h-12 bg-primary/20 text-primaryDark rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl">✨</div>
          <h3 class="font-bold text-base mb-1">طعم أصيل ومذاق مميز</h3>
          <p class="text-xs text-gray-500">أصالة الطبخ المصري والشامي والفطائر التراثية المحبوبة.</p>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  private api = inject(ApiService);

  categories = signal<Category[]>([]);
  products = signal<Product[]>([]);
  selectedCategoryId = signal<number>(0);

  filteredProducts = signal<Product[]>([]);

  ngOnInit() {
    this.api.getCategories().subscribe(cats => this.categories.set(cats));
    this.api.getProducts().subscribe(prods => {
      this.products.set(prods);
      this.filteredProducts.set(prods);
    });
  }

  onCategorySelect(id: number) {
    this.selectedCategoryId.set(id);
    if (id === 0) {
      this.filteredProducts.set(this.products());
    } else {
      this.filteredProducts.set(this.products().filter(p => p.categoryId === id));
    }
  }
}
