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
    <main dir="rtl" class="container-wide mx-auto px-3 py-6 md:px-4 md:py-10">
      @if (product(); as item) {
        <nav aria-label="مسار التنقل" class="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-500 md:mb-7 md:text-sm">
          <a routerLink="/" class="transition-colors hover:text-primary">الرئيسية</a><span class="text-gray-300">/</span>
          <a routerLink="/menu" class="transition-colors hover:text-primary">منيو سوق وسفرة</a><span class="text-gray-300">/</span>
          <span class="max-w-[60vw] truncate font-semibold text-primaryDark">{{ language.isEnglish() ? (item.nameEn || item.nameAr) : item.nameAr }}</span>
        </nav>

        <div class="grid items-start gap-5 lg:grid-cols-2 lg:gap-8 xl:gap-10">
          <section class="min-w-0">
            <div class="group relative mx-auto aspect-[4/3] w-full max-w-[540px] overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-[#fff8ee] to-white p-2 shadow-[0_20px_60px_-32px_rgba(114,61,22,.35)]">
              <img [src]="imageUrl(item.imageUrl)" [alt]="item.nameAr" class="h-full w-full rounded-[1.5rem] object-cover transition-transform duration-500 group-hover:scale-[1.03]">
              @if (discountPercent()) { <span class="absolute right-4 top-4 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-md">خصم {{ discountPercent() }}%</span> }
              @if (!item.isAvailable) { <span class="absolute bottom-4 right-4 rounded-full bg-gray-900/75 px-3 py-1.5 text-xs font-bold text-white">غير متاح حالياً</span> }
            </div>
          </section>

          <section class="rounded-[2rem] border border-orange-100 bg-white p-4 shadow-[0_18px_50px_-36px_rgba(114,61,22,.45)] md:p-7 lg:p-8">
            <div class="mb-4 flex flex-wrap items-center gap-2">
              @if (item.isAvailable) { <span class="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"><span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>متوفر الآن</span> }
              @else { <span class="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">غير متاح حالياً</span> }
              @if (discountPercent()) { <span class="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-primaryDark">عرض خاص</span> }
            </div>

            <h1 class="text-2xl font-black leading-snug text-primaryDark md:text-3xl">{{ language.isEnglish() ? (item.nameEn || item.nameAr) : item.nameAr }}</h1>
            <p class="mt-3 text-sm leading-7 text-gray-600 md:text-base">{{ language.isEnglish() ? (item.descriptionEn || item.descriptionAr || 'Freshly prepared with selected ingredients.') : (item.descriptionAr || 'محضر طازج يومياً بمكونات مختارة ومذاق شهي.') }}</p>

            <div class="my-5 flex flex-wrap items-baseline gap-2 border-b border-gray-100 pb-5">
              <strong class="text-2xl font-extrabold text-primary md:text-3xl">{{ currentPrice() }} <span class="text-sm font-bold">{{ language.isEnglish() ? 'AED' : 'درهم' }}</span></strong>
              @if (discountPercent()) { <del class="text-sm text-gray-400">{{ item.basePrice }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</del><span class="text-xs font-semibold text-green-700">وفّر {{ item.basePrice - currentPrice() }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span> }
            </div>

            @if (item.variants && item.variants.length > 0) {
              <div class="my-5">
                <div class="mb-3 flex items-center justify-between gap-2"><h2 class="font-bold text-gray-900">اختار الحجم أو الخيار</h2><span class="text-[11px] text-gray-400">اختر اختياراً واحداً</span></div>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  @for (variant of item.variants; track variant.variantId ?? variant.nameAr) {
                    <button type="button" (click)="selectedVariant.set(variant)" [attr.aria-pressed]="selectedVariant() === variant" [class.border-primary]="selectedVariant() === variant" [class.bg-orange-50]="selectedVariant() === variant" class="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 text-right transition-colors hover:border-primary/60">
                      <span class="flex min-w-0 items-center gap-2"><span class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border" [class.border-primary]="selectedVariant() === variant" [class.bg-primary]="selectedVariant() === variant"><span class="h-1.5 w-1.5 rounded-full bg-white" [class.hidden]="selectedVariant() !== variant"></span></span><span class="truncate text-sm font-semibold text-gray-800">{{ language.isEnglish() ? (variant.nameEn || variant.nameAr) : variant.nameAr }}</span></span>
                      <span class="whitespace-nowrap text-sm font-bold text-primary">{{ variant.price }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
                    </button>
                  }
                </div>
              </div>
            }

            @if (item.addons.length) {
              <div class="my-5 rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
                <div class="mb-3 flex items-center justify-between"><h2 class="font-bold text-gray-900">إضافات اختيارية</h2><span class="text-[11px] text-gray-500">يمكن اختيار أكثر من إضافة</span></div>
                <div class="space-y-2">
                  @for (addon of item.addons; track addon.addonId) {
                    <label class="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm">
                      <span class="flex items-center gap-2"><input type="checkbox" [checked]="isAddonSelected(addon)" (change)="toggleAddon(addon)" class="h-4 w-4 accent-orange-600"><span class="text-sm font-semibold text-gray-800">{{ language.isEnglish() ? addon.nameEn : addon.nameAr }}</span></span>
                      <span class="text-sm font-bold text-primary">+{{ addon.price }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
                    </label>
                  }
                </div>
              </div>
            }

            <div class="my-5">
              <label for="special-notes" class="mb-2 block font-bold text-gray-900">تعليمات خاصة <span class="text-xs font-normal text-gray-400">(اختياري)</span></label>
              <textarea id="special-notes" rows="3" [(ngModel)]="specialInstructions" class="w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="مثال: بدون مخلل، الصوص على جنب..."></textarea>
            </div>

            <div class="sticky bottom-2 z-20 mt-6 flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 p-2 shadow-lg backdrop-blur md:gap-4 md:p-3">
              <div class="flex shrink-0 items-center gap-2 rounded-full bg-gray-100 p-1" aria-label="تحديد الكمية">
                <button type="button" (click)="decreaseQuantity()" aria-label="تقليل الكمية" class="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-gray-700 transition hover:bg-white">−</button>
                <span class="min-w-5 text-center font-bold tabular-nums">{{ quantity() }}</span>
                <button type="button" (click)="increaseQuantity()" aria-label="زيادة الكمية" class="flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold text-gray-700 transition hover:bg-white">+</button>
              </div>
              <button type="button" [disabled]="!item.isAvailable" (click)="addToCart(item)" class="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primaryDark active:scale-[.99] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none md:text-base">
                <span>أضف إلى السلة</span><span class="rounded-full bg-white/15 px-2 py-0.5 text-xs">{{ totalPrice() }} {{ language.isEnglish() ? 'AED' : 'درهم' }}</span>
              </button>
            </div>
          </section>
        </div>

        @if (recommendations().length) {
          <section class="mt-10 border-t border-gray-100 pt-7 md:mt-14 md:pt-9">
            <div class="mb-4 flex items-end justify-between"><div><p class="text-xs font-bold text-primary">اختيارات تانية ليك</p><h2 class="mt-1 text-xl font-extrabold text-primaryDark">قد يعجبك أيضاً</h2></div><a routerLink="/menu" class="text-xs font-bold text-primary hover:underline">عرض المنيو</a></div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3 md:gap-4">
              @for (suggestion of recommendations(); track suggestion.productId) { <app-product-card [product]="suggestion"></app-product-card> }
            </div>
          </section>
        }
      } @else {
        <div class="py-24 text-center text-gray-500">{{ loading() ? 'جاري تحميل المنتج...' : 'المنتج غير موجود' }}</div>
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
