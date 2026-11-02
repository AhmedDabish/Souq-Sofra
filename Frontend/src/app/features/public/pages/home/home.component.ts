import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
              <div class="relative flex min-h-[260px] items-center sm:min-h-[285px] md:min-h-[310px]">
                <div class="relative w-full min-h-[260px] sm:min-h-[285px] md:min-h-[300px] px-4 py-6 sm:px-6 md:w-[99%] md:py-10 rounded-[20px] md:rounded-s-[10rem] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
                     [style.backgroundColor]="offer.color">
                  <div class="relative z-10 flex max-w-[62%] flex-col justify-center gap-2.5 sm:gap-3.5 md:max-w-[50%] md:pe-2 lg:pe-6 2xl:!max-w-[55%]">
                    <h2 class="text-sm leading-tight text-black font-bold line-clamp-2 sm:text-base md:text-xl xl:text-2xl">{{ language.isEnglish() ? offer.titleEn : offer.title }}</h2>
                    <span class="text-[10px] leading-snug sm:text-xs md:text-sm lg:text-base line-clamp-3">
                      <p>{{ language.isEnglish() ? offer.descriptionEn : offer.description }}</p>
                    </span>
                    <a class="w-fit rounded-full px-3 py-2 text-[10px] font-semibold text-white transition-all duration-300 hover:opacity-85 sm:px-4 sm:text-xs md:text-base"
                       [routerLink]="offerLink(offer.title)"
                       style="background-color: rgb(0, 0, 0);">
                      {{ language.isEnglish() ? offer.buttonTextEn : offer.buttonText }}
                    </a>
                  </div>
                  <div class="absolute start-4 top-0 z-20 rounded-b-[10px] px-2.5 py-1.5 text-[10px] font-bold shadow-md sm:start-5 sm:px-3 sm:text-xs md:text-sm"
                       [style.backgroundColor]="offer.badgeBg"
                       style="color: rgb(255, 255, 255);">
                    {{ language.isEnglish() ? offer.badgeEn : offer.badge }}
                  </div>
                </div>
                <div class="absolute end-0 top-1/2 z-0 flex h-auto w-[39%] max-w-[160px] -translate-y-1/2 items-center overflow-hidden rounded-full sm:max-w-[190px] md:end-0 md:w-[38%] md:max-w-[270px] xl:max-w-[320px]">
                  <div class="relative w-full h-full overflow-hidden">
                    <div class="relative aspect-square w-full overflow-hidden rounded-full rounded-spin-img-wrapper">
                      <img [alt]="language.isEnglish() ? offer.titleEn : offer.title" width="350" height="350"
                           class="bg-background p-1.5 sm:p-3 animate-spin [animation-duration:150s] rounded-full relative block h-full w-full object-contain overflow-hidden"
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
          <div class="relative min-h-[220px] md:min-h-[300px] xl:min-h-[340px] rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
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
    this.api.getSettings().subscribe({ next: settings => {
      this.promoBanners = [1, 2].map(index => {
        const url = settings[`PromoBanner${index}`];
        if (!url) return index === 1 ? 'assets/morein-banner-1.png' : 'assets/morein-banner-2.jpg';
        return /^https?:\/\//i.test(url) || url.startsWith('assets/') ? url : `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
      });
    }, error: () => {} });
    this.api.getCategories().subscribe(categories => this.categories.set(categories));
    this.api.getProducts().subscribe(products => this.products.set(products));
    this.api.getBestSellingProducts().subscribe({ next: products => this.bestSellingProducts.set(products), error: () => this.bestSellingProducts.set([]) });
  }

  onCategorySelect(categoryId: number) {
    this.selectedCategoryId.set(categoryId);
    this.router.navigate(['/menu'], { queryParams: { categoryId } });
  }
}
