import { Component, HostListener, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
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
    <app-category-slider [isEnglish]="language.isEnglish()" [categories]="categories()" [selectedId]="selectedCategoryId()" (categorySelected)="onCategorySelect($event)"></app-category-slider>

    <section class="widget-container" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <div class="container-wide widget-spacing">
        <div class="flex items-center justify-between widget-content-spacing">
          <div>
            <h2 class="theme-title">{{ language.t('المنتجات', 'Products') }}</h2>
            <p class="mt-1 text-xs text-gray-500">{{ language.t('تصفح منتجاتنا المتنوعة', 'Browse our selection') }}</p>
          </div>
          <a routerLink="/menu" class="shrink-0 rounded-full bg-gray px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white">{{ language.t('عرض الكل', 'View all') }}</a>
        </div>

        @if (homeProducts().length > 0) {
          <div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 2xl:grid-cols-5">
            @for (prod of homeProducts(); track prod.productId) {
              <app-product-card [product]="prod"></app-product-card>
            }
          </div>
        } @else if (productsLoaded()) {
          <div class="mt-4 rounded-2xl border border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-500">
            {{ language.t('لا توجد منتجات متاحة حالياً.', 'No products are available right now.') }}
          </div>
        } @else {
          <div class="mt-4 grid grid-cols-1 gap-3 sm:gap-4" [attr.aria-label]="language.t('جاري تحميل المنتجات', 'Loading products')">
            @for (placeholder of [1, 2, 3, 4]; track placeholder) {
              <div class="h-36 animate-pulse rounded-2xl bg-white shadow-sm"></div>
            }
          </div>
        }
      </div>
    </section>

    @if (featuredProducts().length > 0) {
      <section class="widget-container">
        <div class="container-wide widget-spacing">
          <div class="flex items-center justify-between widget-content-spacing"><h2 class="theme-title">{{ language.t('المنتجات المميزة', 'Featured products') }}</h2></div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
            @for (prod of featuredProducts(); track prod.productId) { <app-product-card [product]="prod"></app-product-card> }
          </div>
        </div>
      </section>
    }

    <!-- More-In style rotating offer cards -->
    <div class="widget-container">
      <div class="w-full overflow-x-clip">
        <section class="container-wide widget-spacing">
          <div class="grid gap-5 grid-cols-1 lg:grid-cols-2">
            @for (offer of offers; track offer.title) {
              <div class="mx-auto flex w-[92%] max-w-[360px] items-center relative max-md:mt-25 min-h-[200px] md:min-h-[310px] max-h-[360px] md:mx-0 md:w-full md:max-w-none">
                <div class="relative w-full min-h-[200px] md:min-h-[300px] md:w-[99%] pt-18 pb-4 px-6 md:py-10 max-md:rounded-se-[20px] max-md:rounded-ee-[20px] md:rounded-se-[10rem] md:rounded-ee-[10rem] rounded-ss-[20px] rounded-es-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                     [style.backgroundColor]="offer.color">
                  <div class="md:pe-2 lg:pe-6 2xl:!pe-2 flex flex-col justify-center gap-3.5 md:gap-3.5 max-w-full md:max-w-[50%] 2xl:!max-w-[55%]">
                    <h2 class="text-base text-black md:text-xl xl:text-2xl font-bold leading-tight line-clamp-1">{{ language.isEnglish() ? offer.titleEn : offer.title }}</h2>
                    <span class="text-xs md:text-sm lg:text-base line-clamp-2">
                      <p>{{ language.isEnglish() ? offer.descriptionEn : offer.description }}</p>
                    </span>
                    <a class="text-white w-fit px-4 py-2 rounded-full text-xs md:text-base font-medium hover:opacity-85 transition-all duration-300"
                       [routerLink]="offerLink(offer.title)"
                       style="background-color: rgb(0, 0, 0);">
                      {{ language.isEnglish() ? offer.buttonTextEn : offer.buttonText }}
                    </a>
                  </div>
                  <div class="absolute top-0 start-5 px-3 py-1.5 rounded-b-[10px] font-bold text-xs md:text-sm shadow-md z-20"
                       [style.backgroundColor]="offer.badgeBg"
                       style="color: rgb(255, 255, 255);">
                    {{ language.isEnglish() ? offer.badgeEn : offer.badge }}
                  </div>
                </div>
                <div class="absolute h-full max-md:top-0 max-md:end-1/2 md:top-1/2 md:end-0 -translate-y-[65%] md:-translate-y-1/2 ltr:max-md:translate-x-1/2 rtl:max-md:-translate-x-1/2 flex items-center h-fit w-[165px] md:w-[200px] lg:w-[270px] 3xl:!w-[350px] z-30 rounded-full overflow-hidden">
                  <div class="relative w-full h-full overflow-hidden">
                    <div class="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center max-md:items-end rounded-spin-img-wrapper">
                      <img [alt]="offer.title" width="350" height="350"
                           class="bg-background p-4 animate-spin [animation-duration:150s] rounded-full relative block object-contain overflow-hidden max-md:object-bottom"
                           [src]="offer.image">
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      </div>
    </div>

    <!-- More-In style paired promotional banners -->
    <section class="widget-container">
      <div class="container-wide widget-spacing grid grid-cols-1 lg:grid-cols-2 gap-5">
        @for (banner of promoBanners; track banner) {
          <div class="group relative mx-auto min-h-[220px] w-[92%] max-w-[360px] overflow-hidden rounded-[20px] shadow-sm transition-all duration-300 hover:shadow-md md:mx-0 md:min-h-[300px] md:w-full md:max-w-none xl:min-h-[340px]">
            <img [src]="banner" [alt]="language.t('عروض سوق وسفرة', 'Souq & Sofra offers')" loading="lazy" class="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          </div>
        }
      </div>
    </section>

    <!-- Best sellers ranked from completed order items -->
    <section class="widget-container">
      <div class="container-wide widget-spacing">
        <div class="flex items-center justify-between widget-content-spacing">
          <h2 class="theme-title">{{ language.t('الأكثر مبيعاً', 'Best sellers') }}</h2>
          <a routerLink="/menu" class="bg-gray text-primary px-4 py-2 rounded-full font-medium text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors">{{ language.t('الكل', 'View all') }}</a>
        </div>
        @if (bestSellingProducts().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 xl:gap-6 gap-4">
            @for (prod of bestSellingProducts(); track prod.productId) {
              <app-product-card [product]="prod"></app-product-card>
            }
          </div>
        } @else {
          <div class="py-10 text-center text-gray-400 text-sm">{{ language.t('ستظهر المنتجات الأكثر مبيعاً بعد تسجيل الطلبات.', 'Best sellers will appear here once orders are recorded.') }}</div>
        }
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  language = inject(LanguageService);

  categories = signal<Category[]>([]);
  selectedCategoryId = signal(0);
  products = signal<Product[]>([]);
  productsLoaded = signal(false);
  homeProductLimit = signal(16);
  homeProducts = computed(() => this.products().slice(0, this.homeProductLimit()));
  bestSellingProducts = signal<Product[]>([]);
  featuredProducts = computed(() => {
    // Featured products are specifically those with discounts (on sale)
    const discounted = this.products().filter(p => p.discountPrice != null && p.discountPrice > 0 && p.discountPrice < p.basePrice);
    if (discounted.length > 0) return discounted;
    return this.products().filter(p => p.isFeatured);
  });
  offers = [
    {
      title: 'فامـلي بوكس كلاسيك', titleEn: 'Family Box Classic',
      description: 'جبنه موتزريلا- مكيس خضار(فلفل اخضر ومشروم وبصل وزيتون اسود) -سلامي مدخن -تركي مدخن- بيف بيكون -كراست شيدر وموتزريلا', descriptionEn: 'Mozzarella, mixed vegetables (green pepper, mushrooms, onion and black olives), smoked salami, smoked turkey, beef bacon, and a cheddar-mozzarella crust.',
      badge: 'جديد', badgeEn: 'New',
      badgeBg: 'rgb(251, 176, 66)',
      color: 'rgb(245, 130, 41)',
      image: 'assets/morein-family.png',
      buttonText: 'احصل علي العرض', buttonTextEn: 'Get this offer'
    },
    {
      title: 'ناشفيل تشيكن بان', titleEn: 'Nashville Chicken Pan',
      description: 'صلصة ناشفيل +فلفل اخضر+بصل+زيتون اخضر +جبنه موتزريلا+دجاج +زيت ناشفيل+توابل ناشفيل+صوص رانش', descriptionEn: 'Nashville sauce, green pepper, onion, green olives, mozzarella, chicken, Nashville oil and seasoning, and ranch sauce.',
      badge: 'مميز', badgeEn: 'Featured',
      badgeBg: 'rgb(245, 130, 41)',
      color: 'rgb(251, 176, 66)',
      image: 'assets/morein-nashville.png',
      buttonText: 'احصل على العرض', buttonTextEn: 'Get this offer'
    }
  ];
  promoBanners = ['assets/morein-banner-1.png', 'assets/morein-banner-2.jpg'];

  offerLink(title: string): string[] {
    const searchTerms = title.includes('فام')
      ? ['family box', 'فاملي', 'فاميلي', 'بوكس كلاسيك']
      : ['nashville', 'ناشفيل', 'بيتي بان'];
    const product = this.products().find(item => {
      const name = `${item.nameAr} ${item.nameEn}`.toLocaleLowerCase();
      return searchTerms.some(term => name.includes(term.toLocaleLowerCase()));
    });

    // Use the matching local product page when it exists; otherwise keep the
    // offer CTA useful by taking visitors to the menu, not an external product URL.
    return product ? ['/product', String(product.productId)] : ['/menu'];
  }

  ngOnInit() {
    this.updateHomeProductLimit();
    this.api.getSettings().subscribe({ next: settings => {
      this.promoBanners = [1, 2].map(index => {
        const url = settings[`PromoBanner${index}`];
        if (!url) return index === 1 ? 'assets/morein-banner-1.png' : 'assets/morein-banner-2.jpg';
        return /^https?:\/\//i.test(url) || url.startsWith('assets/') ? url : `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
      });
    }, error: () => {} });
    this.api.getCategories().subscribe(categories => this.categories.set(categories));
    this.api.getProducts().subscribe({
      next: products => { this.products.set(products); this.productsLoaded.set(true); },
      error: () => { this.products.set([]); this.productsLoaded.set(true); }
    });
    this.api.getBestSellingProducts().subscribe({ next: products => this.bestSellingProducts.set(products), error: () => this.bestSellingProducts.set([]) });
  }

  @HostListener('window:resize')
  updateHomeProductLimit() {
    const width = typeof window === 'undefined' ? 1280 : window.innerWidth;
    const columns = width >= 1536 ? 5 : width >= 1024 ? 4 : width >= 768 ? 3 : 2;
    this.homeProductLimit.set(columns * 4);
  }

  onCategorySelect(categoryId: number) {
    this.selectedCategoryId.set(categoryId);
    this.router.navigate(['/menu'], { queryParams: { categoryId } });
  }
}
