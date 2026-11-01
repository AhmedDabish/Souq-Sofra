import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { CategorySliderComponent } from '../../components/category-slider/category-slider.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Category, Product } from '../../../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroSliderComponent, CategorySliderComponent, ProductCardComponent],
  template: `
    <app-hero-slider></app-hero-slider>
    <app-category-slider [categories]="categories()" [selectedId]="selectedCategoryId()" (categorySelected)="onCategorySelect($event)"></app-category-slider>

    @if (featuredProducts().length > 0) {
      <section class="widget-container">
        <div class="container-wide widget-spacing">
          <div class="flex items-center justify-between widget-content-spacing"><h2 class="theme-title">المنتجات المميزة</h2></div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
            @for (prod of featuredProducts(); track prod.productId) { <app-product-card [product]="prod"></app-product-card> }
          </div>
        </div>
      </section>
    }

    <!-- More-In style rotating offer cards -->
    <section class="widget-container overflow-x-clip">
      <div class="container-wide widget-spacing grid grid-cols-1 lg:grid-cols-2 gap-5">
        @for (offer of offers; track offer.title) {
          <article class="relative flex items-center min-h-[180px] md:min-h-[300px] max-h-[400px]">
            <div class="relative w-full min-h-[180px] md:min-h-[270px] ps-6 pe-24 md:pe-32 py-8 md:py-10 rounded-s-[20px] md:rounded-s-[10rem] rounded-e-[20px] md:rounded-e-[10rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300" [style.backgroundColor]="offer.color">
              <div class="relative z-10 flex flex-col justify-center gap-3 max-w-full md:max-w-[58%]">
                <h2 class="text-base md:text-xl xl:text-2xl font-bold leading-tight line-clamp-1 text-gray-950">{{ offer.title }}</h2>
                <p class="text-xs md:text-sm leading-relaxed line-clamp-2 text-gray-900">{{ offer.description }}</p>
                <a routerLink="/menu" class="w-fit px-4 py-2 rounded-full bg-black text-white text-xs md:text-sm font-semibold hover:bg-black/80 transition-all duration-300">احصل على العرض</a>
              </div>
              <span class="absolute top-0 right-5 px-3 py-1.5 rounded-b-[10px] bg-[#fbb042] text-white font-bold text-xs md:text-sm shadow-md z-20">{{ offer.badge }}</span>
            </div>
            <div class="absolute top-1/2 left-0 -translate-x-1/3 md:translate-x-1/3 -translate-y-1/2 w-[145px] md:w-[200px] lg:w-[250px] aspect-square z-30 rounded-full overflow-hidden pointer-events-none">
              <img [src]="offer.image" [alt]="offer.title" class="w-full h-full object-contain bg-[#faf7f2] p-3 md:p-4 rounded-full animate-spin [animation-duration:150s]">
            </div>
          </article>
        }
      </div>
    </section>

    <!-- More-In style paired promotional banners -->
    <section class="widget-container">
      <div class="container-wide widget-spacing grid grid-cols-1 lg:grid-cols-2 gap-5">
        @for (banner of promoBanners; track banner) {
          <div class="relative min-h-[160px] md:min-h-[200px] rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
            <img [src]="banner" alt="عروض سوق وسفرة" loading="lazy" class="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          </div>
        }
      </div>
    </section>

    <!-- Best sellers ranked from completed order items -->
    <section class="widget-container">
      <div class="container-wide widget-spacing">
        <div class="flex items-center justify-between widget-content-spacing">
          <h2 class="theme-title">الأكثر مبيعاً</h2>
          <a routerLink="/menu" class="bg-gray text-primary px-4 py-2 rounded-full font-medium text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors">الكل</a>
        </div>
        @if (bestSellingProducts().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 xl:gap-6 gap-4">
            @for (prod of bestSellingProducts(); track prod.productId) {
              <app-product-card [product]="prod"></app-product-card>
            }
          </div>
        } @else {
          <div class="py-10 text-center text-gray-400 text-sm">ستظهر المنتجات الأكثر مبيعاً بعد تسجيل الطلبات.</div>
        }
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  categories = signal<Category[]>([]);
  selectedCategoryId = signal(0);
  products = signal<Product[]>([]);
  bestSellingProducts = signal<Product[]>([]);
  featuredProducts = computed(() => {
    // Featured products are specifically those with discounts (on sale)
    const discounted = this.products().filter(p => p.discountPrice != null && p.discountPrice > 0 && p.discountPrice < p.basePrice);
    if (discounted.length > 0) return discounted;
    return this.products().filter(p => p.isFeatured);
  });
  offers = [
    { title: 'فامـلي بوكس كلاسيك', description: 'جبنة موتزاريلا، خضار طازجة، سلامي وتركي مدخن، مع كراست الشيدر والموتزاريلا.', badge: 'جديد', color: '#f58229', image: 'assets/morein-family.png' },
    { title: 'ناشفيل تشيكن بان', description: 'دجاج ناشفيل مع الفلفل والبصل والزيتون الأخضر والموتزاريلا وصوص الرانش.', badge: 'مميز', color: '#f58229', image: 'assets/morein-nashville.png' }
  ];
  promoBanners = ['assets/morein-banner-1.png', 'assets/morein-banner-2.png'];

  ngOnInit() {
    this.api.getCategories().subscribe(categories => this.categories.set(categories));
    this.api.getProducts().subscribe(products => this.products.set(products));
    this.api.getBestSellingProducts().subscribe({ next: products => this.bestSellingProducts.set(products), error: () => this.bestSellingProducts.set([]) });
  }

  onCategorySelect(categoryId: number) {
    this.selectedCategoryId.set(categoryId);
    this.router.navigate(['/menu'], { queryParams: { categoryId } });
  }
}
