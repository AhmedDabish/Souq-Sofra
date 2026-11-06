import { Component, HostListener, inject, signal, computed, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { HeroSliderComponent } from '../../components/hero-slider/hero-slider.component';
import { CategorySliderComponent } from '../../components/category-slider/category-slider.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Category, Product, RestaurantReview } from '../../../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeroSliderComponent, CategorySliderComponent, ProductCardComponent],
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
    @if (promoBanners.length) {
    <section class="widget-container">
      <div class="container-wide widget-spacing grid grid-cols-1 lg:grid-cols-2 gap-5">
        @for (banner of promoBanners; track $index; let index = $index) {
          <div [class.promo-banner-first]="index === 0" [class.promo-banner-second]="index === 1" class="group relative mx-auto min-h-[220px] w-[92%] max-w-[360px] overflow-hidden rounded-[20px] shadow-sm transition-all duration-300 hover:shadow-md md:mx-0 md:min-h-[300px] md:w-full md:max-w-none xl:min-h-[340px]">
            <img [src]="banner" [alt]="language.t('عروض سوق وسفرة', 'Souq & Sofra offers')" loading="lazy" class="absolute inset-0 w-full h-full object-contain md:object-cover transform transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          </div>
        }
      </div>
    </section>
    }

    <!-- Best sellers ranked from completed order items -->
    <section class="widget-container">
      <div class="container-wide widget-spacing">
        <div class="flex items-center justify-between widget-content-spacing">
          <h2 class="theme-title">{{ language.t('الأكثر مبيعاً', 'Best sellers') }}</h2>
          <a routerLink="/menu" class="bg-gray text-primary px-4 py-2 rounded-full font-medium text-xs cursor-pointer hover:bg-primary hover:text-white transition-colors">{{ language.t('الكل', 'View all') }}</a>
        </div>
        @if (bestSellingProducts().length > 0) {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
            @for (prod of bestSellingProducts(); track prod.productId) {
              <app-product-card [product]="prod"></app-product-card>
            }
          </div>
        } @else {
          <div class="py-10 text-center text-gray-400 text-sm">{{ language.t('ستظهر المنتجات الأكثر مبيعاً بعد تسجيل الطلبات.', 'Best sellers will appear here once orders are recorded.') }}</div>
        }
      </div>
    </section>

    <!-- Restaurant Reviews Section -->
    <section class="widget-container bg-[#fcfbf7] border-t border-gray-100 py-10 md:py-16" [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'">
      <div class="container-wide widget-spacing">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 widget-content-spacing">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-xs font-bold mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 fill-current text-amber-500" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>{{ language.t('آراء وتجارب العملاء', 'Customer Reviews') }}</span>
            </div>
            <h2 class="theme-title">{{ language.t('تقييمات زوار مطعم سوق سفرة', 'Restaurant Guest Reviews') }}</h2>
            <p class="mt-1 text-xs sm:text-sm text-gray-500">
              {{ language.t('شاركنا تجربتك في المطعم بالتقييم أو الفيديو وانضم لمجتمع سفرة', 'Share your dining experience with a review or video') }}
            </p>
          </div>
          <button
            type="button"
            (click)="toggleReviewForm()"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-primaryDark active:scale-95 cursor-pointer self-start sm:self-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
            <span>{{ showReviewForm() ? language.t('إغلاق النموذج', 'Close form') : language.t('أضف تقييمك للمطعم', 'Add your review') }}</span>
          </button>
        </div>

        <!-- Add Review Form (Expandable) -->
        @if (showReviewForm()) {
          <div class="mb-10 rounded-2xl bg-white p-5 md:p-8 shadow-sm border border-orange-100 transition-all">
            <h3 class="text-base font-extrabold text-[#252238] mb-1">
              {{ language.t('تقييم جديد للمطعم', 'New Restaurant Review') }}
            </h3>
            <p class="text-xs text-gray-500 mb-5">
              {{ language.t('الاسم والتقييم إجباري، ويمكنك اختيارياً رفع صورتك أو فيديو تقييمك.', 'Name and review are required. Photo and video are optional.') }}
            </p>

            <form (submit)="submitRestaurantReview($event)">
              <!-- Stars Rating Picker -->
              <div class="mb-4">
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  {{ language.t('التقييم العام (إجباري)', 'Rating (required)') }}
                </label>
                <div class="flex items-center gap-1.5" dir="ltr">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <button
                      type="button"
                      (click)="newRating.set(star)"
                      class="text-2xl transition transform hover:scale-125 focus:outline-none cursor-pointer">
                      <span [class.text-amber-400]="star <= newRating()" [class.text-gray-300]="star > newRating()">★</span>
                    </button>
                  }
                  <span class="text-xs font-bold text-gray-700 ms-2">({{ newRating() }} / 5)</span>
                </div>
              </div>

              <!-- Name & Comment Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 mb-1.5">
                    {{ language.t('اسمك الكريم (إجباري)', 'Your name (required)') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newCustomerName"
                    name="customerName"
                    required
                    class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    [placeholder]="language.t('مثال: سيف المهيري', 'e.g. Saif Al-Muhairi')" />
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-xs font-bold text-gray-700 mb-1.5">
                  {{ language.t('اكتب تقييمك وتجربتك (إجباري)', 'Write your review (required)') }} <span class="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  [(ngModel)]="newComment"
                  name="comment"
                  required
                  class="w-full rounded-xl border border-gray-200 bg-white p-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  [placeholder]="language.t('كيف كانت تجربتك في المطعم؟ طعم الأكل، سرعة التوصيل، الخدمة...', 'How was your experience? Food taste, delivery speed, hospitality...')"></textarea>
              </div>

              <!-- Optional Avatar & Video Uploads -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <!-- Avatar Upload (Optional) -->
                <div class="rounded-xl border border-dashed border-gray-200 bg-[#fafafa] p-4">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-gray-800">{{ language.t('صورتك الشخصية', 'Profile photo') }}</span>
                    <span class="text-[11px] text-gray-400 font-medium">{{ language.t('اختياري', 'Optional') }}</span>
                  </div>
                  <p class="text-[11px] text-gray-500 mb-2.5 leading-relaxed">
                    {{ language.t('إذا لم ترفع صورة، سيتم وضع صورة رمزية (Avatar) ممتعة لك تلقائياً.', 'If you don\'t upload a photo, a fun avatar will be chosen automatically.') }}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    (change)="onAvatarSelected($event)"
                    class="block w-full text-xs text-gray-500 file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-primary hover:file:bg-orange-200 file:cursor-pointer" />
                </div>

                <!-- Video Upload (Optional) -->
                <div class="rounded-xl border border-dashed border-gray-200 bg-[#fafafa] p-4">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-gray-800">{{ language.t('فيديو تقييم المطعم', 'Restaurant review video') }}</span>
                    <span class="text-[11px] text-gray-400 font-medium">{{ language.t('اختياري', 'Optional') }}</span>
                  </div>
                  <p class="text-[11px] text-gray-500 mb-2.5 leading-relaxed">
                    {{ language.t('يمكنك رفع مقطع فيديو قصير لتقييم وجبتك أو تجربة المطعم (MP4 / WEBM).', 'You can upload a short video reviewing your food or experience.') }}
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    (change)="onVideoSelected($event)"
                    class="block w-full text-xs text-gray-500 file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-primary hover:file:bg-orange-200 file:cursor-pointer" />
                </div>
              </div>

              <!-- Alerts -->
              @if (reviewSubmitError()) {
                <div class="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
                  {{ reviewSubmitError() }}
                </div>
              }
              @if (reviewSubmitSuccess()) {
                <div class="mb-4 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700">
                  {{ reviewSubmitSuccess() }}
                </div>
              }

              <button
                type="submit"
                [disabled]="isSubmittingReview()"
                class="rounded-xl bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-primaryDark disabled:bg-gray-300 cursor-pointer">
                {{ isSubmittingReview() ? language.t('جاري رفع ونشر التقييم...', 'Uploading and saving review...') : language.t('نشر التقييم الآن', 'Submit review now') }}
              </button>
            </form>
          </div>
        }

        <!-- Reviews Cards Grid -->
        @if (restaurantReviews().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            @for (rev of restaurantReviews(); track rev.reviewId) {
              <div class="flex flex-col justify-between rounded-2xl bg-white p-5 shadow-xs border border-gray-100 hover:shadow-md transition-shadow">
                <div>
                  <div class="flex items-center justify-between gap-3 mb-3">
                    <div class="flex items-center gap-3">
                      <img
                        [src]="resolveMediaUrl(rev.avatarUrl)"
                        [alt]="rev.customerName"
                        class="h-11 w-11 rounded-full object-cover border-2 border-orange-100 bg-orange-50 shrink-0" />
                      <div>
                        <h4 class="text-sm font-extrabold text-gray-900 leading-tight">{{ rev.customerName }}</h4>
                        <div class="flex items-center text-amber-400 text-xs mt-0.5" dir="ltr">
                          @for (s of [1, 2, 3, 4, 5]; track s) {
                            <span [class.text-amber-400]="s <= rev.rating" [class.text-gray-200]="s > rev.rating">★</span>
                          }
                        </div>
                      </div>
                    </div>
                    <span class="text-[11px] text-gray-400 font-medium">{{ rev.createdAt | date:'shortDate' }}</span>
                  </div>

                  <p class="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {{ rev.comment }}
                  </p>
                </div>

                <!-- Video Preview if present -->
                @if (rev.videoUrl) {
                  <div class="mt-2 rounded-xl overflow-hidden bg-black aspect-video max-h-48 border border-gray-200 shadow-inner">
                    <video
                      controls
                      preload="metadata"
                      class="w-full h-full object-cover"
                      [src]="resolveMediaUrl(rev.videoUrl)">
                      {{ language.t('متصفحك لا يدعم تشغيل الفيديو', 'Your browser does not support video playback') }}
                    </video>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="py-12 text-center bg-white rounded-2xl border border-gray-100 p-6">
            <p class="text-sm text-gray-500 mb-3">{{ language.t('كن أول من يشاركنا تقييمه لمطعم سوق سفرة!', 'Be the first to share your review of Souq Sofra!') }}</p>
            <button
              type="button"
              (click)="showReviewForm.set(true)"
              class="rounded-full bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primaryDark transition cursor-pointer">
              {{ language.t('أضف تقييمك الآن', 'Add your review now') }}
            </button>
          </div>
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


  restaurantReviews = signal<RestaurantReview[]>([]);
  showReviewForm = signal(false);
  newRating = signal(5);
  newCustomerName = '';
  newComment = '';
  selectedAvatarFile: File | null = null;
  selectedVideoFile: File | null = null;
  isSubmittingReview = signal(false);
  reviewSubmitSuccess = signal('');
  reviewSubmitError = signal('');

  toggleReviewForm() {
    this.showReviewForm.update(v => !v);
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedAvatarFile = input.files[0];
    } else {
      this.selectedAvatarFile = null;
    }
  }

  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedVideoFile = input.files[0];
    } else {
      this.selectedVideoFile = null;
    }
  }

  loadRestaurantReviews() {
    this.api.getRestaurantReviews().subscribe({
      next: revs => this.restaurantReviews.set(revs),
      error: () => this.restaurantReviews.set([])
    });
  }

  submitRestaurantReview(event: Event) {
    event.preventDefault();
    if (!this.newCustomerName.trim()) {
      this.reviewSubmitError.set(this.language.t('يرجى كتابة اسمك الكريم', 'Please enter your name'));
      return;
    }
    if (!this.newComment.trim()) {
      this.reviewSubmitError.set(this.language.t('يرجى كتابة تقييمك وتجربتك', 'Please enter your review'));
      return;
    }

    this.isSubmittingReview.set(true);
    this.reviewSubmitError.set('');
    this.reviewSubmitSuccess.set('');

    const formData = new FormData();
    formData.append('customerName', this.newCustomerName.trim());
    formData.append('comment', this.newComment.trim());
    formData.append('rating', this.newRating().toString());

    if (this.selectedAvatarFile) {
      formData.append('avatar', this.selectedAvatarFile);
    }
    if (this.selectedVideoFile) {
      formData.append('video', this.selectedVideoFile);
    }

    this.api.createRestaurantReview(formData).subscribe({
      next: () => {
        this.isSubmittingReview.set(false);
        this.reviewSubmitSuccess.set(this.language.t('شكراً لك! تم إضافة ونشر تقييمك بنجاح.', 'Thank you! Your review has been submitted successfully.'));
        this.newCustomerName = '';
        this.newComment = '';
        this.selectedAvatarFile = null;
        this.selectedVideoFile = null;
        this.loadRestaurantReviews();
        setTimeout(() => {
          this.reviewSubmitSuccess.set('');
          this.showReviewForm.set(false);
        }, 2500);
      },
      error: (err) => {
        this.isSubmittingReview.set(false);
        this.reviewSubmitError.set(err?.error?.message || this.language.t('حدث خطأ أثناء حفظ التقييم', 'Failed to submit review'));
      }
    });
  }

  resolveMediaUrl(url?: string): string {
    if (!url) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofra&backgroundColor=b6e3f4';
    if (/^https?:\/\//i.test(url) || url.startsWith('assets/') || url.startsWith('data:')) return url;
    return `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
  }

  ngOnInit() {
    this.updateHomeProductLimit();
    this.api.getSettings().subscribe({ next: settings => {
      const countSetting = settings['PromoBannerCount'];
      const count = countSetting === undefined ? 2 : Math.max(0, Math.min(20, Number.parseInt(countSetting, 10) || 0));
      this.promoBanners = Array.from({ length: count }, (_, i) => {
        const index = i + 1;
        const url = settings[`PromoBanner${index}`];
        if (!url && countSetting === undefined) return index === 1 ? 'assets/morein-banner-1.png' : 'assets/morein-banner-2.jpg';
        if (!url) return '';
        return /^https?:\/\//i.test(url) || url.startsWith('assets/') ? url : `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`;
      }).filter(Boolean);
    }, error: () => {} });
    this.api.getCategories().subscribe(categories => this.categories.set(categories));
    this.api.getProducts().subscribe({
      next: products => { this.products.set(products); this.productsLoaded.set(true); },
      error: () => { this.products.set([]); this.productsLoaded.set(true); }
    });
    this.api.getBestSellingProducts().subscribe({ next: products => this.bestSellingProducts.set(products), error: () => this.bestSellingProducts.set([]) });
    this.loadRestaurantReviews();
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
