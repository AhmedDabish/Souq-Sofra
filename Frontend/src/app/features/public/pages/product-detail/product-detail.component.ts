import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { CartService } from '../../../../core/services/cart.service';
import { LanguageService } from '../../../../core/services/language.service';
import { Product, ProductAddon, ProductVariant } from '../../../../core/models/models';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  template: `
    <main [attr.dir]="language.isEnglish() ? 'ltr' : 'rtl'" class="container-wide mx-auto px-3 py-6 md:px-4 md:py-10">
      @if (product(); as item) {
        <nav [attr.aria-label]="language.t('مسار التنقل', 'Breadcrumb')" class="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-500 md:text-sm">
          <a routerLink="/" class="transition-colors hover:text-primary">{{ language.t('الرئيسية', 'Home') }}</a><span class="text-gray-300">/</span>
          <a routerLink="/menu" class="transition-colors hover:text-primary">{{ language.t('المنيو', 'Menu') }}</a><span class="text-gray-300">/</span>
          <span class="max-w-[60vw] truncate font-semibold text-primaryDark">{{ language.isEnglish() ? (item.nameEn || item.nameAr) : item.nameAr }}</span>
        </nav>

        <div class="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5 md:p-6">
          <div class="grid grid-cols-1 items-start gap-5 md:grid-cols-[2fr_3fr] md:gap-8">
            <section class="min-w-0">
              <div class="group relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f7f5f0] shadow-inner">
                <img [src]="imageUrl(item.imageUrl)" [alt]="language.isEnglish() ? (item.nameEn || item.nameAr) : item.nameAr" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]">
                @if (discountPercent()) {
                  <span class="absolute right-3 top-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm sm:right-4 sm:top-4">{{ language.t('خصم', 'Save') }} {{ discountPercent() }}%</span>
                }
                @if (!item.isAvailable) {
                  <span class="absolute bottom-3 right-3 rounded-lg bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-white">{{ language.t('غير متوفر حالياً', 'Currently unavailable') }}</span>
                }
              </div>
            </section>

            <section class="flex min-w-0 flex-col gap-4 md:sticky md:top-24">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                <span class="font-semibold tracking-wide text-gray-400">SOFRA · {{ item.productId }}</span>
                @if (item.isAvailable) {
                  <span class="inline-flex items-center gap-1.5 font-bold text-green-600"><span class="h-2 w-2 rounded-full bg-green-500"></span>{{ language.t('متوفر', 'Available') }}</span>
                } @else {
                  <span class="font-bold text-gray-500">{{ language.t('غير متوفر', 'Unavailable') }}</span>
                }
              </div>

              <div>
                <h1 class="text-2xl font-black leading-tight text-[#252238] sm:text-3xl">{{ language.isEnglish() ? (item.nameEn || item.nameAr) : item.nameAr }}</h1>
                @if (language.isEnglish() ? item.descriptionEn : item.descriptionAr) {
                  <p class="mt-3 text-sm leading-7 text-gray-600">{{ language.isEnglish() ? item.descriptionEn : item.descriptionAr }}</p>
                }
              </div>

              <div class="flex flex-wrap items-end gap-x-3 gap-y-1 border-b border-gray-100 pb-4">
                <strong class="text-2xl font-extrabold text-primary sm:text-3xl">{{ currentPrice() }} <span class="text-sm font-bold">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span></strong>
                @if (discountPercent()) {
                  <del class="pb-1 text-sm text-gray-400">{{ item.basePrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</del>
                  <span class="flex items-center gap-1 pb-1 text-xs font-bold text-green-600">{{ language.t('وفرت', 'You save') }} {{ item.basePrice - currentPrice() }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
                }
              </div>

              @if (item.variants && item.variants.length > 0) {
                <div>
                  <h2 class="mb-3 text-sm font-bold text-gray-800">{{ language.t('اختيارك من الحجم', 'Choose a size') }}</h2>
                  <div class="space-y-2">
                    @for (variant of item.variants; track variant.variantId ?? variant.nameAr) {
                      <button type="button" (click)="selectedVariant.set(variant)" [attr.aria-pressed]="selectedVariant() === variant" [class.border-primary]="selectedVariant() === variant" [class.bg-orange-50]="selectedVariant() === variant" class="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 p-3.5 text-start transition-all duration-200 hover:border-primary/60 sm:p-4">
                        <span class="flex min-w-0 items-center gap-3">
                          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border" [class.border-primary]="selectedVariant() === variant" [class.bg-primary]="selectedVariant() === variant"><span class="h-2 w-2 rounded-full bg-white" [class.hidden]="selectedVariant() !== variant"></span></span>
                          <span class="truncate text-sm font-semibold text-gray-800">{{ language.isEnglish() ? (variant.nameEn || variant.nameAr) : variant.nameAr }}</span>
                        </span>
                        <span class="whitespace-nowrap text-sm font-bold text-gray-900">{{ variant.price }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
                      </button>
                    }
                  </div>
                </div>
              }

              @if (item.addons.length) {
                <div>
                  <div class="mb-3 flex items-center justify-between gap-2"><h2 class="text-sm font-bold text-gray-800">{{ language.t('إضافات اختيارية', 'Optional extras') }}</h2><span class="text-[11px] text-gray-400">{{ language.t('اختياري', 'Optional') }}</span></div>
                  <div class="space-y-2">
                    @for (addon of item.addons; track addon.addonId) {
                      <label class="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-primary/50">
                        <span class="flex items-center gap-2.5"><input type="checkbox" [checked]="isAddonSelected(addon)" (change)="toggleAddon(addon)" class="h-4 w-4 accent-orange-600"><span class="text-sm font-medium text-gray-800">{{ language.isEnglish() ? addon.nameEn : addon.nameAr }}</span></span>
                        <span class="whitespace-nowrap text-sm font-semibold text-gray-700">+{{ addon.price }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
                      </label>
                    }
                  </div>
                </div>
              }

              <label for="special-notes" class="block text-sm font-bold text-gray-800">{{ language.t('ملاحظات على الطلب', 'Order notes') }} <span class="font-normal text-gray-400">({{ language.t('اختياري', 'optional') }})</span>
                <textarea id="special-notes" rows="2" [(ngModel)]="specialInstructions" class="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" [placeholder]="language.t('مثال: بدون مخلل، الصوص على جنب...', 'For example: no pickles, sauce on the side...')"></textarea>
              </label>

              <div class="flex items-center gap-3 pt-1">
                <div class="flex shrink-0 items-center gap-3 rounded-xl border border-gray-200 px-2 py-1.5" [attr.aria-label]="language.t('تحديد الكمية', 'Choose quantity')">
                  <button type="button" (click)="decreaseQuantity()" [attr.aria-label]="language.t('تقليل الكمية', 'Decrease quantity')" class="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-gray-600 transition hover:bg-gray-100">−</button>
                  <span class="min-w-5 text-center text-sm font-bold tabular-nums">{{ quantity() }}</span>
                  <button type="button" (click)="increaseQuantity()" [attr.aria-label]="language.t('زيادة الكمية', 'Increase quantity')" class="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-bold text-gray-600 transition hover:bg-gray-100">+</button>
                </div>
                <button type="button" [disabled]="!item.isAvailable" (click)="addToCart(item)" class="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primaryDark active:scale-[.99] disabled:cursor-not-allowed disabled:bg-gray-300 sm:text-base">
                  <span>{{ language.t('إضافة للسلة', 'Add to cart') }}</span><span class="text-xs font-semibold">({{ totalPrice() }} {{ language.isEnglish() ? 'AED' : 'درهم' }})</span>
                </button>
              </div>
            </section>
          </div>
        </div>

        
        <!-- Product Reviews & Ratings Section -->
        <section class="mt-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:mt-10 md:p-8">
          <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-extrabold text-[#252238] sm:text-2xl">
                  {{ language.t('تقييمات وآراء العملاء', 'Customer Reviews') }}
                </h2>
                <div class="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current text-amber-400" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span>{{ reviewsSummary()?.averageRating || 5 }} / 5</span>
                  <span class="text-gray-400 font-normal">({{ reviewsSummary()?.totalReviews || 0 }})</span>
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500 sm:text-sm">
                {{ language.t('شاركنا رأيك وتقييمك لهذا السندوتش وساعد الآخرين في الاختيار', 'Share your rating and feedback for this item') }}
              </p>
            </div>
            <button
              type="button"
              (click)="showReviewForm.set(!showReviewForm())"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-orange-100 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              <span>{{ showReviewForm() ? language.t('إغلاق النموذج', 'Close form') : language.t('أضف تقييمك للسندوتش', 'Write a review') }}</span>
            </button>
          </div>

          <!-- Add Review Form -->
          @if (showReviewForm()) {
            <form (submit)="submitProductReview($event)" class="mb-8 rounded-xl bg-[#faf9f5] p-4 border border-orange-100 sm:p-5">
              <h3 class="text-sm font-bold text-gray-900 mb-3">
                {{ language.t('تقييمك للمنتج', 'Rate this sandwich') }}
              </h3>

              <!-- Star Rating Selector -->
              <div class="mb-4">
                <span class="block text-xs font-semibold text-gray-600 mb-1.5">{{ language.t('التقييم بالنجوم (إجباري)', 'Star rating (required)') }}</span>
                <div class="flex items-center gap-1.5" dir="ltr">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <button
                      type="button"
                      (click)="newReviewRating.set(star)"
                      class="text-2xl transition transform hover:scale-110 focus:outline-none cursor-pointer">
                      <span [class.text-amber-400]="star <= newReviewRating()" [class.text-gray-300]="star > newReviewRating()">★</span>
                    </button>
                  }
                  <span class="text-xs font-bold text-gray-700 ms-2">({{ newReviewRating() }} / 5)</span>
                </div>
              </div>

              <!-- Name & Comment Fields -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 mb-1">
                    {{ language.t('الاسم الكريم (إجباري)', 'Your name (required)') }}
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="newReviewName"
                    name="customerName"
                    required
                    class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    [placeholder]="language.t('مثال: أحمد عبد الله', 'e.g. Ahmed Abdullah')" />
                </div>
              </div>
              <div class="mb-3">
                <label class="block text-[11px] font-medium text-gray-500 mb-1 flex items-center justify-between">
                  <span>{{ language.t('رقم الهاتف', 'Phone number') }}</span>
                  <span class="text-[10px] text-gray-400 font-normal">({{ language.t('اختياري', 'optional') }})</span>
                </label>
                <input type="tel" [(ngModel)]="newReviewPhone" name="phoneNumber" autocomplete="tel" class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" [placeholder]="language.t('05xxxxxxxx', 'Phone number')" />
              </div>

              <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-700 mb-1">
                  {{ language.t('رأيك أو تعليقك على السندوتش (اختياري)', 'Your review or comment (optional)') }}
                </label>
                <textarea
                  rows="3"
                  [(ngModel)]="newReviewComment"
                  name="comment"
                  class="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  [placeholder]="language.t('اكتب تعليقك هنا عن جودة الطعم والتجربة...', 'Write your feedback on taste, freshness...')"></textarea>
              </div>

              @if (reviewError()) {
                <div class="mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600">
                  {{ reviewError() }}
                </div>
              }

              @if (reviewSuccess()) {
                <div class="mb-3 rounded-lg bg-green-50 p-2.5 text-xs font-semibold text-green-700">
                  {{ reviewSuccess() }}
                </div>
              }

              <button
                type="submit"
                [disabled]="submittingReview()"
                class="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primaryDark disabled:bg-gray-300 cursor-pointer">
                {{ submittingReview() ? language.t('جاري الحفظ...', 'Submitting...') : language.t('نشر التقييم', 'Submit Review') }}
              </button>
            </form>
          }

          <!-- Reviews List -->
          @if (reviewsSummary()?.reviews?.length) {
            <div class="space-y-3">
              @for (rev of reviewsSummary()!.reviews; track rev.productReviewId) {
                <div class="rounded-xl border border-gray-100 bg-[#fafafa] p-4 transition">
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                      <div class="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-primary font-bold text-xs">
                        {{ rev.customerName.charAt(0) }}
                      </div>
                      <div>
                        <span class="text-xs font-bold text-gray-800">{{ rev.customerName }}</span>
                        <div class="flex items-center text-amber-400 text-xs mt-0.5" dir="ltr">
                          @for (s of [1, 2, 3, 4, 5]; track s) {
                            <span [class.text-amber-400]="s <= rev.rating" [class.text-gray-200]="s > rev.rating">★</span>
                          }
                        </div>
                      </div>
                    </div>
                    <span class="text-[10px] text-gray-400">{{ rev.createdAt | date:'shortDate' }}</span>
                  </div>
                  @if (rev.comment) {
                    <p class="text-xs leading-relaxed text-gray-600 sm:text-sm ps-10">{{ rev.comment }}</p>
                  }
                </div>
              }
            </div>
          } @else {
            <div class="py-8 text-center text-xs text-gray-400 sm:text-sm">
              {{ language.t('لا توجد تقييمات لهذا السندوتش بعد. كن أول من يقيّمه!', 'No reviews for this item yet. Be the first to review it!') }}
            </div>
          }
        </section>

        @if (recommendations().length) {
          <section class="mt-8 border-t border-gray-100 pt-7 md:mt-10">
            <div class="mb-4 flex items-end justify-between"><div><p class="text-xs font-bold text-primary">{{ language.t('اختيارات تانية ليك', 'Picked for you') }}</p><h2 class="mt-1 text-xl font-extrabold text-primaryDark">{{ language.t('قد يعجبك أيضاً', 'You may also like') }}</h2></div><a routerLink="/menu" class="text-xs font-bold text-primary hover:underline">{{ language.t('عرض المنيو', 'Browse menu') }}</a></div>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
              @for (suggestion of recommendations(); track suggestion.productId) { <app-product-card [product]="suggestion"></app-product-card> }
            </div>
          </section>
        }
      } @else {
        <div class="py-24 text-center text-gray-500">{{ loading() ? language.t('جاري تحميل المنتج...', 'Loading product...') : language.t('المنتج غير موجود', 'Product not found') }}</div>
      }
    </main>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cart = inject(CartService);
  product = signal<Product | null>(null);
  allProducts = signal<Product[]>([]);
  selectedVariant = signal<ProductVariant | undefined>(undefined);
  selectedAddons = signal<ProductAddon[]>([]);
  language = inject(LanguageService);
  quantity = signal(1);
  specialInstructions = '';
  loading = signal(true);
  currentPrice = computed(() => {
    const product = this.product();
    const variant = this.selectedVariant();
    if (!product) return 0;
    if (variant) {
      if (product.discountPrice && product.discountPrice < product.basePrice && variant.isDefault) {
        return Math.round(variant.price * product.discountPrice / product.basePrice * 100) / 100;
      }
      return variant.price;
    }
    return product.discountPrice ?? product.basePrice;
  });
  totalPrice = computed(() => (this.currentPrice() + this.selectedAddons().reduce((sum, addon) => sum + addon.price, 0)) * this.quantity());
  discountPercent = computed(() => { const p = this.product(); return p?.discountPrice && p.discountPrice < p.basePrice ? Math.round(100 * (p.basePrice - p.discountPrice) / p.basePrice) : 0; });
  recommendations = computed(() => this.allProducts().filter(p => p.productId !== this.product()?.productId).slice(0, 4));

  ngOnInit() {
    this.api.getProducts().subscribe({ next: products => {
      this.allProducts.set(products);
      this.route.paramMap.subscribe(params => {
        const id = Number(params.get('id'));
        const found = products.find(p => p.productId === id) ?? null;
        this.product.set(found);
        this.selectedVariant.set(found?.variants?.find(v => v.isDefault) ?? found?.variants?.[0]);
        this.loading.set(false);
        if (found) {
          this.loadProductReviews(found.productId);
        }
      });
    }, error: () => this.loading.set(false) });
  }
  
  reviewsSummary = signal<any>(null);
  showReviewForm = signal(false);
  newReviewRating = signal(5);
  newReviewName = '';
  newReviewPhone = '';
  newReviewComment = '';
  submittingReview = signal(false);
  reviewError = signal('');
  reviewSuccess = signal('');

  loadProductReviews(productId: number) {
    this.api.getProductReviews(productId).subscribe({
      next: summary => this.reviewsSummary.set(summary),
      error: () => this.reviewsSummary.set(null)
    });
  }

  submitProductReview(e: Event) {
    e.preventDefault();
    if (!this.newReviewName.trim()) {
      this.reviewError.set(this.language.t('يرجى كتابة اسمك الكريم', 'Please enter your name'));
      return;
    }
    const currentProd = this.product();
    if (!currentProd) return;

    this.submittingReview.set(true);
    this.reviewError.set('');
    this.reviewSuccess.set('');

    this.api.createProductReview({
      productId: currentProd.productId,
      customerName: this.newReviewName.trim(),
      phoneNumber: this.newReviewPhone.trim() || undefined,
      rating: this.newReviewRating(),
      comment: this.newReviewComment.trim() || undefined
    }).subscribe({
      next: (savedReview) => {
        this.submittingReview.set(false);
        this.reviewSuccess.set(this.language.t('شكراً لك! تم إضافة تقييمك بنجاح.', 'Thank you! Your review has been added.'));
        this.newReviewName = '';
        this.newReviewPhone = '';
        this.newReviewComment = '';
        this.loadProductReviews(currentProd.productId);
        setTimeout(() => {
          this.reviewSuccess.set('');
          this.showReviewForm.set(false);
        }, 2000);
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.reviewError.set(err?.error?.message || this.language.t('حدث خطأ أثناء حفظ التقييم', 'Failed to save review'));
      }
    });
  }

  imageUrl(url?: string) { if (!url) return 'assets/MAIN.jpg'; return /^https?:\/\//i.test(url) || url.startsWith('assets/') ? url : `http://localhost:2811${url.startsWith('/') ? url : `/${url}`}`; }
  decreaseQuantity() { this.quantity.update(value => Math.max(1, value - 1)); }
  increaseQuantity() { this.quantity.update(value => value + 1); }
  isAddonSelected(addon: ProductAddon) { return this.selectedAddons().some(item => item.addonId === addon.addonId); }
  toggleAddon(addon: ProductAddon) {
    this.selectedAddons.update(items => this.isAddonSelected(addon) ? items.filter(item => item.addonId !== addon.addonId) : [...items, addon]);
  }
  addToCart(product: Product) { this.cart.addItem(product, this.selectedVariant(), this.quantity(), this.specialInstructions, this.selectedAddons()); }
}
