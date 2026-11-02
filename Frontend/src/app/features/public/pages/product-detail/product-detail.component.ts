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

        @if (recommendations().length) {
          <section class="mt-8 border-t border-gray-100 pt-7 md:mt-10">
            <div class="mb-4 flex items-end justify-between"><div><p class="text-xs font-bold text-primary">{{ language.t('اختيارات تانية ليك', 'Picked for you') }}</p><h2 class="mt-1 text-xl font-extrabold text-primaryDark">{{ language.t('قد يعجبك أيضاً', 'You may also like') }}</h2></div><a routerLink="/menu" class="text-xs font-bold text-primary hover:underline">{{ language.t('عرض المنيو', 'Browse menu') }}</a></div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3 md:gap-4">
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
      });
    }, error: () => this.loading.set(false) });
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
